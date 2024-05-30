describe('matches workspace description with Carol updated description', () => {
  it('should matches workspace description with Carol updated description', () => {
    const WorkSpaceName = 'Update Description1';

    const workSpace: Cypress.Workspace = {
      loggedInAs: 'alice',
      name: WorkSpaceName,
      description: 'A workspace focused on amazing projects.',
      website: 'https://amazing.org',
      github: 'https://github.com/amazing'
    };

    const updatedDescription = 'Updated workspace Description.';

    cy.login(workSpace.loggedInAs);
    cy.wait(1000);

    cy.create_workspace(workSpace);
    cy.wait(1000);

    cy.contains(workSpace.name).get(`[data-work-name="${workSpace.name}"]`).click();
    cy.wait(1000);

    cy.contains('Add User').click();
    cy.wait(1000);

    cy.get('input').type('carol');
    cy.wait(1000);

    cy.contains('Select').click();
    cy.wait(1000);

    cy.get('#sphinx-top-level-overlay').should('be.visible');

    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Add User').click();
      cy.wait(1000);
    });
    cy.wait(1000);

    cy.contains('Manage workspace').click();
    cy.wait(1000);

    cy.contains('Update members').click();
    cy.wait(1000);

    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Assign').click();
      cy.wait(1000);
    });
    cy.wait(1000);

    cy.logout(workSpace.loggedInAs);
    cy.wait(1000);

    cy.login('carol');
    cy.wait(1000);

    cy.contains('carol').click({ force: true });
    cy.wait(1000);

    cy.contains(workSpace.name).get(`[data-work-name="${workSpace.name}"]`).click();
    cy.wait(1000);

    cy.contains(/^Edit$/).click();
    cy.wait(1000);

    cy.get('[data-testid="description"]').clear().type(updatedDescription);
    cy.wait(1000);

    cy.contains('Save changes').click();
    cy.wait(600);

    cy.contains('Sucessfully updated workspace');
    cy.wait(1000);

    cy.contains(/^Edit$/).click();
    cy.wait(1000);

    cy.contains(updatedDescription).should('exist');
    cy.wait(600);

    // Deleting the current workspace after a successful assertion.
    cy.get('body').click(0, 0);
    cy.logout('carol');
    cy.wait(1000);

    cy.login(workSpace.loggedInAs);
    cy.wait(1000);

    cy.contains(workSpace.loggedInAs).click({ force: true });
    cy.wait(1000);

    cy.contains(workSpace.name).get(`[data-work-name="${workSpace.name}"]`).click();
    cy.wait(1000);

    cy.contains(/^Edit$/).click();
    cy.wait(1000);

    cy.contains('Delete Workspace').click({ force: true });
    cy.wait(1000);

    cy.contains(/^Delete$/).click();
    cy.wait(1000);
  });
});
