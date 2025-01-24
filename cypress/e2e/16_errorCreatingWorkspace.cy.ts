describe('Workspace creation error handling', () => {
  const workspaceExceedingLimits = {
    loggedInAs: 'alice',
    name: 'ThisNameIsWayTooLongForAWorkspace', // More than 20 characterss
    description:
      'This description is intentionally made longer than one hundred and twenty characters to test the validation functionality of the workspace creation form.' // More than 120 characters
  };

  it('should not allow adding a workspace with excessive character limits', () => {
    cy.wait(1000);
    cy.login(workspaceExceedingLimits.loggedInAs);
    cy.wait(1000);

    cy.clickAlias(workspaceExceedingLimits.loggedInAs);
    cy.wait(1000);

    cy.contains('Workspaces').click();
    cy.wait(1000);

    cy.contains('Add Workspace').click();
    cy.wait(1000);

    cy.get('[placeholder="My Workspace..."]').type(workspaceExceedingLimits.name);
    cy.get('[placeholder="Description Text..."]').type(workspaceExceedingLimits.description);

    cy.wait(600);

    cy.get('[data-testid="add-workspace"]').contains('Add Workspace').should('be.disabled');

    cy.get('[placeholder="My Workspace..."]').parent().contains('Name is too long.');
    cy.get('[placeholder="Description Text..."]').parent().contains('Description is too long.');

    // click outside the modal
    cy.get('body').click(0, 0);
    cy.logout(workspaceExceedingLimits.loggedInAs);
  });
});
