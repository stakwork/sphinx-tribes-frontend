// describe('Delete User from a Workspace', () => {
//   it('Should delete a user to a workspace', () => {
//     const workspace = {
//       loggedInAs: 'alice',
//       name: 'Ali Workspace_test_2',
//       description: 'We are testing out our workspace',
//       website: 'https://community.sphinx.chat',
//       github: 'https://github.com/stakwork/sphinx-tribes-frontend'
//     };
//
//     cy.login(workspace.loggedInAs);
//     cy.wait(1000);
//
//     cy.contains(workspace.loggedInAs).click();
//     cy.wait(1000);
//
//     cy.create_workspace(workspace);
//     cy.wait(1000);
//
//     cy.contains(workspace.name).contains('Manage').click();
//     cy.wait(1000);
//
//     cy.contains('Add User').click();
//     cy.wait(1000);
//
//     cy.get('input').type('bob');
//     cy.wait(1000);
//
//     cy.contains('Select').click();
//     cy.wait(1000);
//
//     cy.get('#sphinx-top-level-overlay').should('be.visible');
//
//     cy.get('#sphinx-top-level-overlay').within(() => {
//       cy.contains('Add User').click();
//       cy.wait(1000);
//     });
//     cy.wait(1000);
//
//     cy.get('#sphinx-top-level-overlay').within(() => {
//       cy.contains('Assign').click();
//       cy.wait(1000);
//     });
//
//     cy.wait(1000);
//
//     cy.get('[data-testid="user_alias"]').contains('bob').should('exist');
//     cy.wait(600);
//
//     cy.get('[data-testid="delete-icon"]').contains('delete').click();
//     cy.wait(1000);
//
//     cy.get('.euiButton').contains('Delete').click({ force: true });
//     cy.wait(100);
//
//     cy.contains('User deleted successfully');
//     cy.wait(600);
//
//     cy.contains('bob').should('not.exist');
//     cy.wait(1000);
//
//     cy.logout(workspace.loggedInAs);
//   });
// });
