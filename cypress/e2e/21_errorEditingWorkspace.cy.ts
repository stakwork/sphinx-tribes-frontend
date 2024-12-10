describe('Alice Create a Workspace and then Edit to validate characters the limit', () => {
  const worksapce = {
    loggedInAs: 'alice',
    name: 'Cypress Workspace1',
    description: 'Cypress Work description'
  };

  const orgExceedingLimits = {
    name: 'ThisNameIsWayTooLongForAnWorkspace',
    description:
      'This description is intentionally made longer than one hundred and twenty characters to test the validation functionality of the workspace creation form.'
  };

  before(() => {
    cy.login(worksapce.loggedInAs);
    cy.wait(1000);
  });

  it('should not allow editing a workspace with excessive character limits', () => {
    cy.get('[data-testid="loggedInUser"]').click();
    cy.wait(1000);

    cy.contains('Workspaces').click();
    cy.wait(1000);

    cy.contains('Add Workspace').click();
    cy.wait(1000);

    cy.get('[placeholder="My Workspace..."]').type(worksapce.name);
    cy.get('[placeholder="Description Text..."]').type(worksapce.description);

    cy.wait(600);

    cy.get('[data-testid="add-workspace"]').contains('Add Workspace').click();
    cy.wait(1000);

    cy.contains('.org-text-wrap', worksapce.name)
      .parents('.org-data')
      .within(() => {
        cy.get('button').contains('Manage').click();
      });
    cy.wait(1000);

    cy.contains(/^Edit$/).click();
    cy.wait(1000);

    cy.get('#name').type(orgExceedingLimits.name);
    cy.get('#description').type(orgExceedingLimits.description);
    cy.wait(1000);

    cy.get('input#name').then(($input) => {
      cy.wrap($input.closest('div')).find('p').should('contain.text', 'name is too long');
    });

    cy.get('textarea#description').then(($textarea) => {
      cy.wrap($textarea.closest('div')).find('p').should('contain.text', 'Description is too long');
    });

    cy.get('body').click(0, 0);
    cy.logout(worksapce.loggedInAs);
  });
});
