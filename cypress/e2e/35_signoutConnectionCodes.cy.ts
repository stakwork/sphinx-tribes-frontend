describe('Sign Out Connection Codes', () => {
  it('should display a message when a user tries to post a bounty without signing in', () => {
    cy.visit('http://localhost:3007');
    cy.wait(1000);

    cy.contains('Bounties').click();
    cy.wait(5000);

    cy.contains('Post a Bounty').click();
    cy.wait(1000);

    cy.contains('Reveal Connection Code').click();
    cy.wait(1000);

    cy.contains('We are out of codes').should('exist');
  });
});
