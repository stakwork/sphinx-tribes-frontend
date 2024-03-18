describe('Delete User to Organization', () => {
  it('Should delete a user to an organization', () => {
    const org = {
      loggedInAs: 'alice',
      name: 'Ali Org_test_2',
      description: 'We are testing out our organization',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.login(org.loggedInAs);
    cy.wait(1000);

    cy.contains(org.loggedInAs).click();
    cy.wait(1000);

    cy.create_org(org);
    cy.wait(1000);

    cy.contains(org.name).contains('Manage').click();
    cy.wait(1000);

    cy.contains('Add User').click();
    cy.wait(1000);

    cy.get('input').type('bob');
    cy.wait(1000);

    cy.contains('Select').click();
    cy.wait(1000);

    cy.get('#sphinx-top-level-overlay').should('be.visible');

    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Add User').click();
      cy.wait(1000);
    });
    cy.wait(1000);

    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Assign').click();
      cy.wait(1000);
    });

    cy.wait(1000);

    cy.get('[data-testid="user_alias"]').contains('bob').should('exist');
    cy.wait(600);

    cy.get('[data-testid="delete-icon"]').contains('delete').click();
    cy.wait(1000);

    cy.get('.euiButton').contains('Delete').click({ force: true });
    cy.wait(100);

    cy.contains('User deleted successfully');
    cy.wait(600);

    cy.contains('bob').should('not.exist');
    cy.wait(1000);

    cy.logout(org.loggedInAs);
  });
});
