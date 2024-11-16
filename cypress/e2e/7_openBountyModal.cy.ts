describe('View Bounty From Modal', () => {

  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Workspace5',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace:'Workspace5',
    title: 'Ali Bounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '844',
    assign: 'carol',
    deliverables: 'I can submit a pr within 2 days of taking the bounty',
    tribe: '',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '09/09/2024'
  };

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
  });

  it('Should view the bounty modal after creating', () => {
    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.wait(600);
    cy.contains('Open').click();
    cy.contains('Assigned').click();
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.get('[data-testid="owner_name"]').contains(workspace.loggedInAs).should('exist');
    cy.wait(1000);

    cy.contains(bounty.title).should('exist');
    cy.wait(1000);

    cy.contains(bounty.description).should('exist');
    cy.wait(1000);

    cy.contains(bounty.deliverables).should('exist');
    cy.wait(1000);

    cy.contains(bounty.assign).should('exist');
    cy.wait(1000);

    cy.contains(bounty.amount).should('exist');
    cy.wait(1000);

    cy.contains('Estimate:').should('exist');
    cy.contains('< 3 hrs').should('exist');
    cy.wait(1000);

    cy.contains('Copy Link').should('exist');
    cy.wait(600);

    cy.contains('Share to Twitter').should('exist');
    cy.wait(600);

    cy.contains('Mark as Paid').should('exist');
    cy.wait(600);

    cy.contains('Pay Bounty').should('exist');
    cy.wait(1000);

    cy.get('body').click(0, 0);
    cy.logout(workspace.loggedInAs);
  });
});
