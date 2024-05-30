describe('Updating Workspace schematic', () => {
  it('Updating A Workspace schematic', () => {
    cy.login('carol');
    cy.wait(1000);

    const WorkSpaceName = 'Workspace Schematic';

    const workspace = {
      loggedInAs: 'carol',
      name: WorkSpaceName,
      description: 'We are testing out our workspace Schematic',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.create_workspace(workspace);
    cy.wait(1000);

    cy.contains(workspace.name).get(`[data-work-name="${workspace.name}"]`).click();
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

    cy.contains('No schematic url yet');

    cy.get('[data-testid="schematic-option-btn"]').click();
    cy.get('[data-testid="schematic-edit-btn"]').click();
    cy.wait(1000);

    cy.contains('Edit Schematic');

    const schematicUrl = 'http://testing.com';
    cy.get('[data-testid="schematic-input"]').type(schematicUrl);
    cy.get('[data-testid="add-schematic-btn"]').click();
    cy.wait(1000);

    cy.get('[data-testid="schematic-url"]').should('have.attr', 'href', schematicUrl);
    cy.wait(1000);

    cy.logout('carol');
  });
});
