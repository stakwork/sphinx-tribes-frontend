describe('Super Admin Bounty Filter SortBy', () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Workspace19',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace: 'Workspace19',
    title: 'MirzaRef',
    category: 'Web development',
    description: 'This is available',
    amount: '123',
    deliverables: 'We are good to go man'
  };

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
  });

  it('Should create six bounties, verify order, change sort, verify new order, and logout', () => {
    for (let i = 1; i <= 6; i++) {
      const updatedBounty = { ...bounty, title: `MirzaRef${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/admin');
    cy.wait(3000);

    // Assert that the bounties are on the bounties list order in Descending order
    for (let i = 6; i >= 1; i--) {
      cy.contains(`MirzaRef${i}`, { timeout: 10000 }).should('exist');
    }

    cy.get('[data-testid="Sort_By"]').contains('Sort By:').click();
    cy.contains('Oldest').click();
    cy.wait(2000);

    // Assert that the first two bounties are no longer visible after changing the sort order
    cy.contains('MirzaRef1').should('not.exist');
    cy.contains('MirzaRef2').should('not.exist');

    cy.logout(workspace.loggedInAs);
  });
});
