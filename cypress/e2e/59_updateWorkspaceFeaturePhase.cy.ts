describe('Workspace Phasing Feature Tests', () => {
  it('Create, Update and Delete Feature Phase functionality', () => {
    cy.login('alice');
    cy.wait(1000);

    const workspaceName = 'Dark Mode';

    const workspace = {
      loggedInAs: 'alice',
      name: workspaceName,
      description: 'We are testing out our workspace feature',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.create_workspace(workspace);
    cy.wait(3000);

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

    cy.get('[data-testid="new-feature-btn"]').click();
    cy.wait(1000);

    cy.contains('Add New Feature');
    const newFeature = 'A new Feature';
    cy.get('[data-testid="feature-input"]').type(newFeature);
    cy.get('[data-testid="add-feature-btn"]').click();
    cy.wait(1000);

    cy.contains(newFeature).should('exist');
    cy.wait(1000);

    cy.get('[data-testid="phase-add-btn"]').click();
    cy.wait(1000);

    const newPhase = 'Bounties Super Admin';

    cy.get('[data-testid="add-phase-input"]').type(newPhase);
    cy.contains('Save').click();
    cy.wait(1000);

    cy.contains(newPhase).should('exist');
    cy.wait(1000);

    cy.get('.MaterialIcon').click();
    cy.wait(500);
    cy.contains('Edit').click();
    cy.wait(1000);

    const editedPhase = 'Super Admin';
    cy.get('[data-testid="edit-phase-input"]').clear().type(editedPhase);
    cy.contains('Save').click();
    cy.wait(1000);

    cy.contains(editedPhase).should('exist');
    cy.wait(1000);

    cy.get('.MaterialIcon').click();
    cy.wait(500);
    cy.contains('Edit').click();
    cy.wait(1000);
    cy.contains('Delete').click();
    cy.wait(1000);
    cy.contains('Delete').click();
    cy.wait(1000);

    cy.contains(editedPhase).should('not.exist');

    cy.logout('alice');
  });
});
