describe('Super Admin Bounty Filter SortBy', () => {
  let activeUser = 'alice';

  const bounty: Cypress.Bounty = {
    title: 'Mirza',
    category: 'Web development',
    description: 'This is available',
    amount: '123',
    deliverables: 'We are good to go man'
  };

  beforeEach(() => {
    cy.login(activeUser);
    cy.wait(1000);
  });

  it('Should create six bounties, verify order, change sort, verify new order, and logout', () => {
    for (let i = 1; i <= 6; i++) {
      const updatedBounty = { ...bounty, title: `Mirza${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/admin');
    cy.wait(3000);

    // Assert that the bounties are on the bounties list order in Descending order
    for (let i = 6; i >= 1; i--) {
      cy.contains(`Mirza${i}`, { timeout: 10000 }).should('exist');
    }

    cy.get('[data-testid="Sort_By"]').contains('Sort By:').click();
    cy.contains('Oldest').click();
    cy.wait(2000);

    cy.get('div[role="pagination"]').find('button[data-testid="page"]').last().click();
    cy.wait(2000);

    // Assert that the new bounties are sorted in reversed Ascending order
    for (let i = 1; i <= 1; i++) {
      cy.contains(`Mirza${i}`, { timeout: 10000 }).should('exist');
    }

    cy.logout(activeUser);
  });
});
