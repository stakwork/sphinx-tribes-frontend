describe('Create Workspace And Update Mission', () => {
  it('Creating an Workspace', () => {
    cy.login('carol');
    cy.wait(1000);

    const WorkSpaceName = 'Workspace Mission';

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

    cy.get('[data-testid="mission-option-btn"]').click();
    cy.get('[data-testid="mission-edit-btn"]').click();

    const missionStatment = 'This is my Mission';
    cy.get('[data-testid="mission-textarea"]').type(missionStatment);
    cy.get('[data-testid="mission-update-btn"]').click();

    cy.get('[data-testid="tactics-option-btn"]').click();
    cy.get('[data-testid="tactics-edit-btn"]').click();

    const tacticsStatment = 'This is my Tactics';
    cy.get('[data-testid="tactics-textarea"]').type(tacticsStatment);
    cy.get('[data-testid="tactics-update-btn"]').click();

    cy.contains(missionStatment).should('exist', { timeout: 1000 });
    cy.contains(tacticsStatment).should('exist', { timeout: 1000 });

    cy.get('button').contains('Add Repository').click();
    cy.get('.euiModal').within(() => {
      cy.get('input[placeholder="Repository name"]').type('Test Repo');
      cy.get('input[placeholder="Repository url"]').type('https://github.com/test/repo');
      cy.get('button').contains('Save').click();
    });
    cy.get('.euiModal').should('not.exist');

    cy.get('h5').contains('Repositories').should('be.visible');

    cy.get('[data-cy="repo-container"]').within(() => {
      cy.get('[data-cy="styled-list"]').should('be.visible');
    });

    cy.get('img[alt="Three dots icon"]').first().click();
    cy.get('.euiModal').within(() => {
      cy.get('input[placeholder="Repository name"]').clear().type('Updated Repo');
      cy.get('input[placeholder="Repository url"]').clear().type('https://github.com/updated/repo');
      cy.get('button').contains('Save').click();
    });
    cy.get('.euiModal').should('not.exist');
    cy.contains('Updated Repo').should('be.visible');
    cy.contains('https://github.com/updated/repo').should('be.visible');

    cy.get('img[alt="Three dots icon"]').first().click();
    cy.get('.euiModal').within(() => {
      cy.get('button').contains('Delete').click();
    });
    cy.get('.euiModal').should('not.exist');
    cy.contains('Updated Repo').should('not.exist');
    cy.contains('https://github.com/updated/repo').should('not.exist');

    cy.logout('carol');
  });
});
