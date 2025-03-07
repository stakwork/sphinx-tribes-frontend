describe('Check for Feature Call Url placeholder', () => {
  beforeEach(() => {
    cy.login('carol');
    cy.wait(1000);
  });

  it('Renders with initial placeholder and opens button on edit button click', () => {
    const WorkSpaceName = 'Workspace Feature 17';

    const workspace = {
      loggedInAs: 'carol',
      name: WorkSpaceName,
      description: 'We are testing out our workspace feature',
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

    cy.contains('Not Configured').should('exist', { timeout: 1000 });
    cy.get('[data-testid="featurecall-option-btn-1"]').click();
    cy.wait(1000);

    cy.get('[data-testid="featurecall-edit-btn-1"]').click();
    cy.wait(1000);

    cy.contains('Edit Feature Call URL').should('exist');
    cy.get('[data-testid="feature-call-url-input"]').should('have.value', '');

    cy.get('[data-testid="feature-call-url-input"]').type('https://testfeature.com');
    cy.wait(1000);

    cy.get('[data-testid="add-featurecall-btn"]').click();
    cy.wait(2000);

    cy.contains('https://testfeature.com').should('exist');
  });
});
