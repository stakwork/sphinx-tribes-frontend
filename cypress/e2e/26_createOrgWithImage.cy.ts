describe('Create Workspace With Image', () => {
  it('creates a workspace with an uploaded image', () => {
    const workspace: Cypress.Workspace = {
      loggedInAs: 'carol',
      name: 'New Workspace With Image',
      description: 'We are testing workspace image upload during creation',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend',
      imageFileName: 'workspace-logo.png'
    };

    cy.login(workspace.loggedInAs);
    cy.wait(1000);

    cy.create_workspace(workspace);

    cy.contains('Sucessfully created workspace').should('exist');
    cy.contains(workspace.name).should('exist');

    cy.logout(workspace.loggedInAs);
  });
});
