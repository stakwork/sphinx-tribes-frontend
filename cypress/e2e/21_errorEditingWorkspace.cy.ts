/* eslint-disable @typescript-eslint/typedef */
describe('Alice Create a Workspace and then Edit to validate characters the limit', () => {
  const workspace = {
    loggedInAs: 'alice',
    name: 'Cypress Workspace1',
    description: 'Cypress Work description'
  };

  const orgExceedingLimits = {
    name: 'ThisNameIsWayTooLongForAnWorkspace',
    description: 'x'.repeat(121) // Exact 121 characters
  };

  it('should not allow editing a workspace with excessive character limits', () => {
    Cypress.config('defaultCommandTimeout', 30000);

    cy.login(workspace.loggedInAs);
    cy.clickAlias(workspace.loggedInAs);

    cy.contains('Workspaces').should('exist').click({ force: true });

    cy.get('body').then(($body) => {
      const overlay = $body.find('#sphinx-top-level-overlay');
      if (overlay.length) {
        overlay.remove();
      }
    });

    cy.get('[data-testid="add-workspace"]').then(($button) => {
      $button.show().prop('disabled', false);
    });

    cy.get('[placeholder="My Workspace..."]').type(workspace.name);
    cy.get('[placeholder="Description Text..."]').type(workspace.description);
    cy.get('[data-testid="add-workspace"]').invoke('removeAttr', 'disabled').click({ force: true });

    cy.contains('.org-text-wrap', workspace.name).then(($el) => {
      const manageButton = $el.parents('.org-data').find('button:contains("Manage")')[0];
      manageButton.click();
    });

    cy.contains('button', /^Edit$/).click({ force: true });

    cy.get('#name').invoke('val', '').type(orgExceedingLimits.name);
    cy.get('#description').invoke('val', '').type(orgExceedingLimits.description);

    cy.get('input#name').then(($input) => {
      expect($input.parent().find('p').text()).to.include('name is too long');
    });

    cy.get('textarea#description').then(($textarea) => {
      expect($textarea.parent().find('p').text()).to.include('Description is too long');
    });

    cy.window().then((win) => win.location.reload());
  });
});
