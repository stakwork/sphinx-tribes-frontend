describe('Create Workspace And Update People On Mission', () => {
  it('Creating A Workspace And Update People', () => {
    cy.login('carol');
    cy.wait(1000);

    const WorkSpaceName = 'People Workspace';

    const workspace = {
      loggedInAs: 'carol',
      name: WorkSpaceName,
      description: 'We are testing out our workspace people mission',
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

    cy.contains('Manage').click();
    cy.contains('Add User').click();
    cy.wait(1000);

    const username = 'Alice';
    cy.contains('Add New User').should('exist');
    cy.get('input[placeholder="Type to search ..."]').type(username.toLowerCase());
    cy.wait(1000);

    cy.contains('Select').click();
    cy.wait(1000);

    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Add User').click();
      cy.wait(1000);
    });

    cy.contains(username).should('exist');
    cy.get('body').click(0, 0);

    cy.logout('carol');
  });
});
