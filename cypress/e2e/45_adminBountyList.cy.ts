describe('Super Admin Bounties List', () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Workspace17',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace: 'Workspace17',
    title: 'AliRazaTask',
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

  it('Should create five bounties and verify they are listed in the admin page under different time frames', () => {
    for (let i = 1; i <= 5; i++) {
      const updatedBounty = { ...bounty, title: `AliRazaTask${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/admin');
    cy.wait(3000);

    for (let i = 1; i <= 5; i++) {
      cy.contains(`AliRazaTask${i}`, { timeout: 10000 }).should('exist');
    }

    cy.get('[data-testid="DropDown"]').click();
    cy.contains('li', '30 Days').click();
    cy.wait(1000);

    for (let i = 1; i <= 5; i++) {
      cy.contains(`AliRazaTask${i}`, { timeout: 10000 }).should('exist');
    }

    cy.get('[data-testid="DropDown"]').click();
    cy.contains('li', '90 Days').click();
    cy.wait(1000);

    for (let i = 1; i <= 5; i++) {
      cy.contains(`AliRazaTask${i}`, { timeout: 10000 }).should('exist');
    }

    cy.logout(workspace.loggedInAs);
  });
});
