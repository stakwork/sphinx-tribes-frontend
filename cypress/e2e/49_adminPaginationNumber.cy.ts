describe('Super Admin Pagination Bounties List', () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Workspace20',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace: 'Workspace20',
    title: 'Pagination Bounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '123',
    tribe: 'Amazing Workspace Tribe',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '09/09/2024',
    deliverables: 'We are good to go man'
  };

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
  });

  it('Should create 22 bounties and verify they are listed in the admin page', () => {
    for (let i = 1; i <= 22; i++) {
      const updatedBounty = { ...bounty, title: `Pagination Bounty ${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/admin');
    cy.wait(3000);

    for (let i = 22; i <= 3; i--) {
      cy.contains(`Pagination Bounty ${i}`, { timeout: 10000 }).should('exist');
    }

    cy.contains(/^2$/).click();
    cy.wait(1000);

    for (let i = 2; i <= 1; i--) {
      cy.contains(`Pagination Bounty ${i}`, { timeout: 10000 }).should('exist');
    }

    cy.logout(workspace.loggedInAs);
  });
});
