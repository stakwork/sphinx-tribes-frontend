describe('Update Requirements in Workspace Feature', () => {
  it('Updating Requirements of a Workspace Feature', () => {
    cy.login('carol');
    cy.wait(1000);

    const WorkSpaceName = 'Requirements Feature Update';

    const workspace = {
      loggedInAs: 'carol',
      name: WorkSpaceName,
      description: 'We are testing out our workspace feature',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.create_workspace(workspace);
    cy.wait(1000);

    cy.contains(workspace.name).contains('Manage').click();
    cy.wait(1000);

    cy.get('[data-testid="mission-link"]')
      .invoke('show')
      .then(($link: JQuery<HTMLElement>) => {
        const modifiedHref = $link.attr('href');
        cy.wrap($link).invoke('removeAttr', 'target');
        cy.wrap($link).click();
        cy.url().should('include', modifiedHref);
      });
    cy.wait(1000);

    cy.contains('No mission yet');
    cy.contains('No tactics yet');

    cy.get('[data-testid="new-feature-btn"]').click();
    cy.wait(1000);

    cy.contains('Add New Feature');

    const newFeature = 'A new Feature';
    cy.get('[data-testid="feature-input"]').type(newFeature);
    cy.get('[data-testid="add-feature-btn"]').click();
    cy.wait(1000);

    cy.contains(newFeature).should('exist', { timeout: 3000 });
    cy.wait(1000);

    cy.get('[data-testid="requirements-option-btn"]').click();
    cy.get('[data-testid="requirements-edit-btn"]').click();

    const updatedRequirements = 'Feature Requirements';
    cy.get('[data-testid="requirements-textarea"]').type(updatedRequirements);
    cy.get('[data-testid="requirements-update-btn"]').click();
    cy.wait(1000);

    cy.contains(updatedRequirements).should('exist', { timeout: 1000 });

    cy.logout('carol');
  });
});
