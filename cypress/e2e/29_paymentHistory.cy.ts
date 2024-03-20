import { formatSat } from '../../src/helpers/helpers-extended';

describe('It Lists all payments in history', () => {
  it('It adds budget, withdraw budget, pay bounties and see all the payments in history', async () => {
    const activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    // create org
    const org = {
      loggedInAs: activeUser,
      name: 'Deduct Budget Org',
      description: 'We are testing out our oeganization',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.create_org(org);
    cy.wait(1000);

    cy.contains('Manage').click();

    const depositAmount = 10000;
    const withdrawAmount = 2000;
    const paymentAmount = 500;
    const afterWithdrawAmount = depositAmount - withdrawAmount;
    const finalPaymentAmount = depositAmount - withdrawAmount - paymentAmount;

    // add organization budget
    cy.contains('Deposit').click();
    cy.get('[data-testid="input-amount"]').type(String(depositAmount));
    cy.get('[data-testid="generate-button"]').click();
    cy.contains('Invoice Created Successfully');
    cy.wait(4000);

    // get invoice from clipboard anf pay bounty
    cy.get('[data-challenge]')
      .invoke('attr', 'data-challenge')
      .then((value) => {
        cy.pay_invoice({ payersName: 'carol', invoice: value });
        cy.wait(3000);
        cy.contains('Successfully Deposited');
        cy.get('body').click(0, 0);
      });

    // Withdraw organization budget
    cy.contains('Withdraw').click();
    cy.wait(1000);

    // generate lightning invoice and withdraw from organization
    cy.add_invoice({ payersName: 'carol', amount: withdrawAmount, memo: '' }).then((res: any) => {
      const invoice = res?.body.response.invoice;
      cy.get('[data-testid="withdrawInvoiceInput"]').type(invoice);
      cy.contains('Confirm').click();
      cy.wait(1000);

      cy.contains('You are about to withdraw');
      cy.get('[data-testid="confirm-withdraw"]').click();
      cy.wait(2000);

      cy.contains('Successfully Withdraw');
      cy.contains(`${withdrawAmount.toLocaleString()} SATS`);
      cy.get('body').click(0, 0);
      cy.wait(1000);

      cy.contains(afterWithdrawAmount.toLocaleString());
      cy.wait(500);
    });

    //  create and pay bounty
    const bounty: Cypress.Bounty = {
      title: 'My History Bounty',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: String(paymentAmount),
      assign: 'carol',
      deliverables: 'We are good to go man',
      organization: org.name,
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    };

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.contains('Assigned').click();
    cy.wait(1000);

    // clicks on bounty
    cy.contains(bounty.title).click();
    cy.wait(1000);

    // paybounty
    cy.contains('Pay Bounty').click();
    cy.wait(1000);

    cy.contains('Confirm').click({ force: true });
    cy.wait(1000);
    cy.contains('Paid successfully');

    // close the bounty
    cy.get('body').click(0, 0);
    cy.wait(1000);

    cy.contains(activeUser).click();
    cy.wait(1000);

    cy.contains(org.name).contains('Manage').click();
    cy.wait(1000);

    cy.contains('History').click({ force: true });
    cy.wait(1000);

    cy.contains('Deposit');
    cy.contains('Payment');
    cy.contains('Withdraw');
    cy.contains(formatSat(paymentAmount));
    cy.contains(formatSat(withdrawAmount));
    cy.contains(formatSat(depositAmount));

    // close the bounty
    cy.get('body').click(0, 0);
    cy.wait(1000);

    cy.contains(finalPaymentAmount.toLocaleString());
    cy.wait(1000);

    cy.logout(activeUser);
  });
});
