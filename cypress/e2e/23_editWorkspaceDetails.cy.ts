describe('Edit Workspace Details', () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Mirza Workspace_test',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org'
  };

  const updatedWorkspace = {
    name: 'WorkspaceBounties',
    description: 'Updated description for our workspace.',
    website: 'https://updated.org'
  };

  it('should edit workspace details successfully', () => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);

    cy.contains(workspace.loggedInAs).click();
    cy.wait(1000);

    cy.create_workspace(workspace);
    cy.wait(1000);

    cy.contains(workspace.name).get(`[data-work-name="${workspace.name}"]`).click();
    cy.wait(1000);

    cy.contains(/^Edit$/).click();
    cy.wait(1000);

    cy.get('[data-testid="name"]').clear().type(updatedWorkspace.name);
    cy.wait(1000);

    cy.get('[data-testid="website"]').clear().type(updatedWorkspace.website);
    cy.wait(1000);

    cy.get('[data-testid="description"]').clear().type(updatedWorkspace.description);
    cy.wait(1000);

    cy.contains('Save changes').click();
    cy.wait(600);

    cy.contains('Sucessfully updated workspace');
    cy.wait(1000);

    cy.contains(updatedWorkspace.name).should('exist');
    cy.wait(600);

    // click outside the modal
    cy.get('body').click(0, 0);
    cy.logout(workspace.loggedInAs);
  });
});
