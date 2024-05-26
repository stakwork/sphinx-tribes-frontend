// describe('Alice tries to paid and unpaid a hunter after creating a bounty', () => {
//   const assignee = 'carol';
//
//   const bounty: Cypress.Bounty = {
//     title: 'My new Bounty for unapaid user',
//     category: 'Web development',
//     coding_language: ['Typescript', 'Javascript', 'Lightning'],
//     description: 'This is available',
//     amount: '123',
//     assign: assignee,
//     deliverables: 'We are good to go man',
//     tribe: '',
//     estimate_session_length: 'Less than 3 hour',
//     estimate_completion_date: '09/09/2024'
//   };
//
//   it('Create a bounty with an assignee then paid and unpaid the user', () => {
//     let activeUser = 'alice';
//     cy.login(activeUser);
//     cy.wait(1000);
//
//     cy.create_bounty(bounty);
//     cy.wait(1000);
//
//     cy.contains('Filter').click();
//     cy.contains('Assigned').click();
//     cy.wait(1000);
//
//     cy.contains(bounty.title).click();
//     cy.wait(1000);
//
//     cy.contains('Mark as Paid').click();
//     cy.wait(1000);
//
//     cy.contains('Next').click();
//     cy.wait(1000);
//
//     cy.contains('Skip and Mark Paid').click();
//     cy.wait(1000);
//
//     cy.contains('paid');
//
//     cy.contains('Mark as Unpaid').click();
//     cy.wait(1000);
//
//     cy.contains('assigned');
//
//     // click outside the modal
//     cy.get('body').click(0, 0);
//
//     cy.logout(activeUser);
//   });
// });
