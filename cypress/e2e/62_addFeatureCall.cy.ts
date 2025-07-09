describe('Check for Feature Call Url placeholder', () => {
  it('Renders with initial placeholder and opens button on edit button click', () => {
    const WorkSpaceName = 'Workspace Feature 17';

    const workspace = {
      loggedInAs: 'carol',
      name: WorkSpaceName,
      description: 'We are testing out our workspace feature',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.login('carol');
    cy.wait(2000);

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

    cy.contains('Not configured. Set up a webhook for feature calls.').should('exist', {
      timeout: 1000
    });
    cy.get('[data-testid="featurecall-add-btn-1"]').click();
    cy.wait(1000);

    cy.contains('Feature Call URL').should('exist');
    cy.wait(1000);
    cy.get('[data-testid="feature-call-url-input"]').should('have.value', '');

    cy.get('[data-testid="feature-call-url-input"]').type('https://testfeature.com');
    cy.wait(1000);

    cy.get('[data-testid="add-featurecall-btn"]').click();
    cy.wait(3000);

    cy.contains('Webhook URL: https://testfeature.com').should('exist');
  });
});
