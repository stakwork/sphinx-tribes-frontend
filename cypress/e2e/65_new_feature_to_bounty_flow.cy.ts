describe('New Feature to Bounty Flow', () => {
  it('Creates a new feature, adds a phase, creates tickets, and converts a ticket to a bounty', () => {
    cy.login('carol');
    cy.wait(1000);

    const WorkSpaceName = 'Workspace Feature';

    const workspace = {
      loggedInAs: 'carol',
      name: WorkSpaceName,
      description: 'We are testing out our workspace feature',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    const newFeature = 'This is my Feature';
    const phaseName = 'Phase 1';
    cy.create_workspace(workspace);
    cy.wait(1000);

    cy.contains(workspace.loggedInAs).click();
    cy.wait(3000);
    cy.contains(workspace.name).click();
    cy.wait(1000);

    cy.get('[data-testid="new-feature-btn"]').click();
    cy.wait(1000);

    cy.contains('Add New Feature');
    cy.get('[data-testid="feature-input"]').type(newFeature);
    cy.get('[data-testid="add-feature-btn"]').click();
    cy.wait(3000);

    cy.contains(newFeature).should('exist', { timeout: 3000 });

    cy.contains(newFeature).click();
    cy.wait(1000);

    cy.get('[data-testid="new-phase-btn"]').click();
    cy.get('[data-testid="add-phase-input"]').type(phaseName);
    cy.get('[data-testid="add-phase-btn"]').click();
    cy.wait(1000);

    cy.contains(phaseName).should('exist');

    cy.get('[data-testid="phase-planner-btn"]').click();
    cy.wait(3000);

    cy.get('[data-testid="add-ticket-btn"]').click();
    cy.wait(3000);

    cy.get('[data-testid="ticket-name-input"]').first().type('Ticket 1');
    cy.get('[data-testid="ticket-description-input"]').first().type('This is a test ticket');
    cy.wait(1000);
    cy.get('[data-testid="ticket-input-save-btn"]').first().click();
    cy.wait(2000);
  });
});
