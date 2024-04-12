describe('It Withdraws from Workspace budget', () => {
  it('It generates an invoice and withdraws from workspace budget', async () => {
    cy.login('carol');
    cy.wait(1000);

    // create org
    const workspace = {
      loggedInAs: 'carol',
      name: 'Deduct Budget Workspace',
      description: 'We are testing out our oeganization',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.create_workspace(workspace);
    cy.wait(1000);

    cy.contains('Manage').click();

    const depositAmount = 10000;
    const withdrawAmount = 2000;
    const currentAmount = depositAmount - withdrawAmount;

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
        cy.pay_invoice({ payersName: 'carol', invoice: value });
        cy.wait(3000);
        cy.contains('Successfully Deposited');
        cy.get('body').click(0, 0);
      });

    // Withdraw workspace budget
    cy.contains('Withdraw').click();
    cy.wait(1000);

    // generate lightning invoice and withdraw from workspace
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

      cy.contains(currentAmount.toLocaleString());
      cy.wait(500);

      // logout
      cy.logout('carol');
    });
  });
});
