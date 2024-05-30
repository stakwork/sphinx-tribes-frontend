describe('Add User to Workspace', () => {
  it('should add a user to a workspace', () => {
    const workspace = {
      loggedInAs: 'carol',
      name: 'TEST E2E',
      description: 'We are testing out our workspace',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.login(workspace.loggedInAs);
    cy.wait(1000);

    cy.create_workspace(workspace);
    cy.wait(1000);

    cy.contains(workspace.name).get(`[data-work-name="${workspace.name}"]`).click();
    cy.wait(1000);

    cy.contains('Add User').click();
    cy.wait(1000);

    cy.get('input').type('alice');
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

    cy.contains('alice').get('[data-testid="settings-icon"]').click();
    cy.wait(1000);

    cy.contains('label', 'Manage bounties').prev('input[type="checkbox"]').should('be.checked');
    cy.wait(1000);

    cy.contains('label', 'Fund workspace').prev('input[type="checkbox"]').should('be.checked');
    cy.wait(1000);

    cy.contains('label', 'Withdraw from workspace')
      .prev('input[type="checkbox"]')
      .should('be.checked');
    cy.wait(1000);

    cy.contains('label', 'View transaction history')
      .prev('input[type="checkbox"]')
      .should('be.checked');
    cy.wait(1000);

    cy.contains('Update roles').click();
    cy.wait(1000);

    cy.wait(1000);
    cy.logout(workspace.loggedInAs);
  });
});
