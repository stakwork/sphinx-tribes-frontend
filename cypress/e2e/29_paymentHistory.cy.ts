import { formatSat } from '../../src/helpers/helpers-extended';

describe('It Lists all payments in history', () => {
  it('It adds budget, withdraw budget, pay bounties and see all the payments in history', () => {
    const activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    // create workspace
    const workSpace = {
      loggedInAs: activeUser,
      name: 'Payment Flow',
      description: 'We are testing out our workspace',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.create_workspace(workSpace);
    cy.wait(1000);

    cy.contains(workSpace.name).get(`[data-work-name="${workSpace.name}"]`).click();
    cy.wait(1000);

    const depositAmount = 10000;
    const withdrawAmount = 2000;
    const paymentAmount = 500;
    const afterWithdrawAmount = depositAmount - withdrawAmount;
    const finalPaymentAmount = depositAmount - withdrawAmount - paymentAmount;

    // add workspace budget
    cy.contains('Deposit').click();
    cy.get('[data-testid="input-amount"]').type(String(depositAmount));
    cy.get('[data-testid="generate-button"]').click();
    cy.contains('Invoice Created Successfully');
    cy.wait(4000);

    // get invoice from clipboard anf pay bounty
    cy.get('[data-challenge]')
      .invoke('attr', 'data-challenge')
      .then((value) => {
        cy.pay_invoice({ invoice: value });
        cy.wait(3000);
        cy.contains('Successfully Deposited');
        cy.get('body').click(0, 0);
      });

    // Withdraw workspace budget
    cy.contains('Withdraw').click();
    cy.wait(1000);

    // generate lightning invoice and withdraw from workspace
    cy.add_invoice({ amount: withdrawAmount }).then((res: any) => {
      const invoice = res?.body.bolt11;
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

      cy.contains(afterWithdrawAmount.toLocaleString()).should('exist', { timeout: 2000 });
      cy.wait(500);
    });

    cy.wait(1000);

    //  create and pay bounty
    const bounty: Cypress.Bounty = {
      title: 'My History Bounty',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: String(paymentAmount),
      assign: 'carol',
      deliverables: 'We are good to go man',
      workspace: workSpace.name,
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

    cy.contains(workSpace.name).get(`[data-work-name="${workSpace.name}"]`).click();
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

    cy.contains(finalPaymentAmount.toLocaleString()).should('exist', { timeout: 2000 });

    cy.logout(activeUser);
  });
});
