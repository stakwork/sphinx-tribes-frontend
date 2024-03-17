import { Decoder } from '@nuintun/qrcode';
const qrcode = new Decoder();

describe('It desposits to an organization  ', () => {
  it('It creates a lightning invoice to add organization budget and pays it', async () => {
    cy.login('carol');
    cy.wait(1000);

    // create org
    const org = {
      loggedInAs: 'carol',
      name: 'Budget Organization',
      description: 'We are testing out our oeganization',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.create_org(org);
    cy.wait(1000);

    cy.contains('Manage').click();
    cy.wait(1000);

    // add organization budget
    cy.contains('Deposit').click();
    cy.wait(1000);

    const budgetAmount = 80000;

    cy.get('[data-testid="input-amount"]').type(String(budgetAmount));
    cy.get('[data-testid="generate-button"]').click();
    cy.contains('Invoice Created Successfully');
    cy.wait(4000);

    // get invoice from clipboard anf pay bounty
    cy.get('[data-challenge]')
      .invoke('attr', 'data-challenge')
      .then((value) => {
        cy.pay_invoice({ payersName: 'carol', invoice: value });
        cy.wait(4000);
        cy.contains('Successfully Deposited');
        cy.get('body').click(0, 0);

        cy.contains(budgetAmount.toLocaleString() + ' ' + 'SATS');
      });

    // logout
    cy.logout('carol');
  });
});
