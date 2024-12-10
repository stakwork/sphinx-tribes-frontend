describe('Create Workspace', () => {
  it('Creating an Workspace', () => {
    cy.login('carol');
    cy.wait(1000);

    cy.create_workspace({
      loggedInAs: 'carol',
      name: 'New Workspace 8',
      description: 'We are testing out our workspace',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    });

    cy.logout('carol');
  });
});
