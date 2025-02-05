describe('Alice Create a Workspace and then Edit to validate characters the limit', () => {
  const workspace = {
    // Fixed typo in variable name (worksapce -> workspace)
    loggedInAs: 'alice',
    name: 'Cypress Workspace1',
    description: 'Cypress Work description'
  };

  const orgExceedingLimits = {
    name: 'ThisNameIsWayTooLongForAnWorkspace',
    description:
      'This description is intentionally made longer than one hundred and twenty characters to test the validation functionality of the workspace creation form.'
  };

  it('should not allow editing a workspace with excessive character limits', () => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.clickAlias(workspace.loggedInAs);
    cy.wait(1000);

    cy.contains('Workspaces').click();
    cy.wait(1000);
    cy.contains('Add Workspace').click();
    cy.wait(1000);

    cy.get('[placeholder="My Workspace..."]').type(workspace.name);
    cy.get('[placeholder="Description Text..."]').type(workspace.description);
    cy.wait(600);
    cy.get('[data-testid="add-workspace"]').contains('Add Workspace').click();
    cy.wait(2000);

    // Handle overlay and manage workspace
    cy.get('#sphinx-top-level-overlay').should('not.exist');
    cy.contains('.org-text-wrap', workspace.name)
      .parents('.org-data')
      .within(() => {
        cy.get('button:contains("Manage")').should('be.visible').click({ force: true });
      });
    cy.wait(1000);

    cy.contains('button', /^Edit$/).click();
    cy.wait(1000);

    cy.get('#name').clear().type(orgExceedingLimits.name);
    cy.get('#description').clear().type(orgExceedingLimits.description);
    cy.wait(1000);

    cy.get('input#name')
      .parent()
      .within(() => {
        cy.contains('p', 'name is too long').should('be.visible');
      });

    cy.get('textarea#description')
      .parent()
      .within(() => {
        cy.contains('p', 'Description is too long').should('be.visible');
      });

    cy.get('body').click(0, 0);
    cy.logout(workspace.loggedInAs);
  });
});
