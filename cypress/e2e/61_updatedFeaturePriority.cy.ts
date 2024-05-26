describe('Update Feature Priority', () => {
  it('Updating Feature Priority', () => {
    cy.login('carol');
    cy.wait(1000);

    const WorkSpaceName = 'Feature Priority';

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

    const features = ['Feature 1', 'Feature 2', 'Feature 3'];
    features.forEach((feature, index) => {
      cy.get('[data-testid="feature-input"]').type(feature);
      cy.get('[data-testid="add-feature-btn"]').click();
      cy.wait(1000);
      cy.contains(feature).should('exist', { timeout: 3000 });

      if (index == 0) {
        cy.contains('priority-arrow-upward-0').should('not.exist', { timeout: 3000 });
        cy.contains('priority-arrow-downward-0').should('not.exist', { timeout: 3000 });
      } else if (index == 1) {
        cy.contains('priority-arrow-upward-0').should('not.exist', { timeout: 3000 });
        cy.contains('priority-arrow-downward-0').should('exist', { timeout: 3000 });
        cy.contains('priority-arrow-upward-1').should('exist', { timeout: 3000 });
        cy.contains('priority-arrow-downward-1').should('not.exist', { timeout: 3000 });
      } else {
        cy.contains('priority-arrow-upward-0').should('not.exist', { timeout: 3000 });
        cy.contains('priority-arrow-downward-0').should('exist', { timeout: 3000 });
        cy.contains('priority-arrow-upward-1').should('exist', { timeout: 3000 });
        cy.contains('priority-arrow-downward-1').should('exist', { timeout: 3000 });
        cy.contains('priority-arrow-upward-2').should('exist', { timeout: 3000 });
        cy.contains('priority-arrow-downward-2').should('not.exist', { timeout: 3000 });
      }
    });

    // Assert the initial order of features
    cy.get('[data-testid="feature-item"]').then(($features) => {
      expect($features).to.have.length(3);
      expect($features[0]).to.contain('Feature 1');
      expect($features[1]).to.contain('Feature 2');
      expect($features[2]).to.contain('Feature 3');
    });

    // Click on priority-arrow-upward icon of the second feature
    cy.get('[data-testid="priority-arrow-upward-1"]').click();
    cy.wait(1000);

    // Assert the new order of features
    cy.get('[data-testid="feature-item"]').then(($features) => {
      expect($features).to.have.length(3);
      expect($features[0]).to.contain('Feature 2');
      expect($features[1]).to.contain('Feature 1');
      expect($features[2]).to.contain('Feature 3');
    });

    // Click on priority-arrow-downward icon of the first feature
    cy.get('[data-testid="priority-arrow-downward-0"]').click();
    cy.wait(1000);

    // Assert the final order of features
    cy.get('[data-testid="feature-item"]').then(($features) => {
      expect($features).to.have.length(3);
      expect($features[0]).to.contain('Feature 1');
      expect($features[1]).to.contain('Feature 2');
      expect($features[2]).to.contain('Feature 3');
    });

    cy.logout('carol');
  });
});
