describe('Create Workspace And Update Mission', () => {
  it('Creating an Workspace', () => {
    cy.login('carol');
    cy.wait(1000);

    const WorkSpaceName = 'Workspace Mission5';

    const workspace = {
      loggedInAs: 'carol',
      name: WorkSpaceName,
      description: 'We are testing out our workspace mission',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.create_workspace(workspace);
    cy.wait(1000);

    cy.contains(workspace.name).contains('Manage').click();
    cy.wait(1000);

    cy.get('[data-testid="mission-link"]').then(($link: JQuery<HTMLElement>) => {
      const modifiedHref = $link.attr('href');
      cy.wrap($link).invoke('removeAttr', 'target');
      cy.wrap($link).click();
      cy.url().should('include', modifiedHref);
    });
    cy.wait(1000);

    cy.contains('No mission yet');
    cy.contains('No tactics yet');

    cy.get('[data-testid="mission-option-btn"]').click();
    cy.get('[data-testid="mission-edit-btn"]').click();

    const missionStatment = 'This is my Mission';
    cy.get('[data-testid="mission-textarea"]').type(missionStatment);
    cy.get('[data-testid="mission-update-btn"]').click();
    cy.get('[data-testid="mission-cancel-btn"]').click();

    cy.get('[data-testid="tactics-option-btn"]').click();
    cy.get('[data-testid="tactics-edit-btn"]').click();

    const tacticsStatment = 'This is my Tactics';
    cy.get('[data-testid="tactics-textarea"]').type(tacticsStatment);
    cy.get('[data-testid="tactics-update-btn"]').click();
    cy.get('[data-testid="tactics-cancel-btn"]').click();

    cy.contains(missionStatment);
    cy.contains(tacticsStatment);

    cy.logout('carol');
  });
});
