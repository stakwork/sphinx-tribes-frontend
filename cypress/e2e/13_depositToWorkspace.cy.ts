// import { Decoder } from '@nuintun/qrcode';
// const qrcode = new Decoder();
//
// describe('It desposits to a workspace  ', () => {
//   it('It creates a lightning invoice to add workspace budget and pays it', async () => {
//     cy.login('carol');
//     cy.wait(1000);
//
//     // create org
//     const workspace = {
//       loggedInAs: 'carol',
//       name: 'Budget Workspace',
//       description: 'We are testing out our workspace',
//       website: 'https://community.sphinx.chat',
//       github: 'https://github.com/stakwork/sphinx-tribes-frontend'
//     };
//
//     cy.create_workspace(workspace);
//     cy.wait(1000);
//
//     cy.contains('Manage').click();
//     cy.wait(1000);
//
//     // add workspace budget
//     cy.contains('Deposit').click();
//     cy.wait(1000);
//
//     const budgetAmount = 80000;
//
//     cy.get('[data-testid="input-amount"]').type(String(budgetAmount));
//     cy.get('[data-testid="generate-button"]').click();
//     cy.contains('Invoice Created Successfully');
//     cy.wait(4000);
//
//     // get invoice from clipboard anf pay bounty
//     cy.get('[data-challenge]')
//       .invoke('attr', 'data-challenge')
//       .then((value) => {
//         cy.pay_invoice({ payersName: 'carol', invoice: value });
//         cy.wait(4000);
//         cy.contains('Successfully Deposited');
//         cy.get('body').click(0, 0);
//
//         cy.contains(`${budgetAmount.toLocaleString()} SATS`).should('exists', { timeout: 2000 });
//       });
//
//     // logout
//     cy.logout('carol');
//   });
// });
