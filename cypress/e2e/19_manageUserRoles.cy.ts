describe('Alice Create an Organization and then manage user roles', () => {
  const org = {
    loggedInAs: 'alice',
    name: 'User Org',
    description: 'We are testing out our organization',
    website: 'https://community.sphinx.chat',
    github: 'https://github.com/stakwork/sphinx-tribes-frontend'
  };

  it('Create and organization and the manage user roles', () => {
    cy.login(org.loggedInAs);
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

    cy.contains('bob').get('[data-testid="settings-icon"]').click();
    cy.wait(1000);

    cy.contains('label', 'Withdraw from organization').prev('input[type="checkbox"]').uncheck();
    cy.wait(1000);

    cy.contains('Update roles').click();
    cy.wait(1000);

    cy.contains('bob').get('[data-testid="settings-icon"]').click();
    cy.wait(1000);

    cy.contains('label', 'Withdraw from organization')
      .prev('input[type="checkbox"]')
      .should('not.be.checked');
    cy.wait(1000);

    cy.get('body').click(0, 0);
    cy.logout(org.loggedInAs);
  });
});
