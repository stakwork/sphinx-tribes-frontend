// describe('I Can Help Flow', () => {
//   let activeUser = 'alice';
//   let secondUser = 'carol';
//
//   const bounty: Cypress.Bounty = {
//     title: 'UmerBounty',
//     category: 'Web development',
//     coding_language: ['Typescript', 'Javascript', 'Lightning'],
//     description: 'This is available',
//     amount: '123',
//     tribe: 'Amazing Workspace Tribe',
//     estimate_session_length: 'Less than 3 hour',
//     estimate_completion_date: '09/09/2024',
//     deliverables: 'We are good to go man',
//     assign: ''
//   };
//
//   beforeEach(() => {
//     cy.clearCookies();
//   });
//
//   it('Verify signup and user connection modals for bounties', () => {
//     cy.login(activeUser);
//     cy.wait(1000);
//
//     for (let i = 1; i <= 3; i++) {
//       const updatedBounty = { ...bounty, title: `UmerBounty${i}` };
//       cy.create_bounty(updatedBounty);
//       cy.wait(1000);
//     }
//
//     cy.get('body').click(0, 0);
//     cy.logout(activeUser);
//     cy.wait(3000);
//
//     cy.contains('I can help').click();
//     cy.wait(600);
//
//     cy.contains('I have Sphinx').click();
//     cy.wait(600);
//
//     cy.login(secondUser);
//     cy.wait(3000);
//
//     cy.contains('Bounties').click();
//     cy.wait(1000);
//
//     cy.contains('I can help').click();
//     cy.wait(1000);
//
//     // Assert you can see Alice's Connect Modal QRcode
//     cy.contains('Discuss this bounty with').should('exist').and('be.visible');
//     cy.get('[data-testid="ican-help-alias"]').contains('alice').should('exist').and('be.visible');
//     cy.wait(1000);
//
//     cy.get('[data-testid="testid-connectimg"]')
//       .contains('person_add')
//       .should('exist')
//       .and('be.visible');
//     cy.wait(1000);
//
//     cy.contains('Connect with Sphinx').should('exist').and('be.visible');
//
//     cy.get('body').click(0, 0);
//     cy.logout(secondUser);
//   });
// });
