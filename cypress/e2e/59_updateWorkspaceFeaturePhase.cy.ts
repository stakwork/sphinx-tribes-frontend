describe('Workspace Phasing Feature Tests', () => {
  const workspaceName = 'Dark Mode';

  const workspace = {
    loggedInAs: 'carol',
    name: workspaceName,
    description: 'We are testing out our workspace feature',
    website: 'https://community.sphinx.chat',
    github: 'https://github.com/stakwork/sphinx-tribes-frontend'
  };

  beforeEach(() => {
    cy.login('carol');
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
  });

  it('should add a new phase', () => {
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
  });

  it('should edit an existing phase', () => {
    cy.get('.MaterialIcon').click();
    cy.contains('Edit').click();
    cy.wait(1000);

    const editedPhase = 'Super Admin';
    cy.get('[data-testid="edit-phase-input"]').clear().type(editedPhase);
    cy.contains('Save').click();
    cy.wait(1000);

    cy.contains(editedPhase).should('exist');
  });

  it('should delete an existing phase', () => {
    const phase = 'Super Admin';
    cy.get('.MaterialIcon').click();
    cy.contains('Edit').click();
    cy.wait(1000);
    cy.contains('Delete').click();
    cy.wait(1000);
    cy.contains('Delete').click();
    cy.wait(1000);

    cy.contains(phase).should('not.exist');
  });

  afterEach(() => {
    cy.logout('carol');
  });
});
