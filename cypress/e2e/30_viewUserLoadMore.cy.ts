describe('Load More For Created And Assigned Bounties', () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'carol',
    name: 'Workspace12',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace:'Workspace12',
    title: 'Syed Bounty',
    category: 'Web development',
    description: 'This is available',
    amount: '12',
    tribe: 'Amazing Workspace Tribe',
    deliverables: 'We are good to go man',
    assign: 'alice'
  };

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
    cy.viewport(1950, 1080);
  });


  it('Thirty bounties should be created and assigned to a user, and they should be visible on both sides', () => {
    for (let i = 1; i <= 22; i++) {
      const updatedBounty = { ...bounty, title: `Syed Bounty${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/p');
    cy.wait(1000);

    cy.get('input').type('alice');
    cy.wait(1000);

    cy.contains('alice').click();
    cy.wait(1000);

    cy.contains('Assigned Bounties').click();
    cy.wait(1000);

    for (let i = 22; i >= 3; i--) {
      cy.contains(`Syed Bounty${i}`, { timeout: 10000 }).should('exist');
    }

    cy.contains('Load More').scrollIntoView().click();
    cy.wait(1000);

    for (let i = 2; i >= 1; i--) {
      cy.contains(`Syed Bounty${i}`, { timeout: 10000 }).should('exist');
    }

    cy.contains(workspace.loggedInAs).click();
    cy.wait(1000);

    cy.get('[data-testid="Bounties-tab"]').click();
    cy.wait(1000);

    for (let i = 22; i >= 3; i--) {
      cy.contains(`Syed Bounty${i}`, { timeout: 10000 }).should('exist');
    }

    cy.contains('Load More').scrollIntoView().click();
    cy.wait(1000);

    for (let i = 2; i >= 1; i--) {
      cy.contains(`Syed Bounty${i}`, { timeout: 10000 }).should('exist');
    }

    cy.get('body').click(0, 0);
    cy.logout(workspace.loggedInAs);
  });
});
