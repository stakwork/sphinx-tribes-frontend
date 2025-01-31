describe('User Journey: Sign in and Submit Proof', () => {
  const assignee = 'bob';
  const bounty: Cypress.Bounty = {
    title: `Proof of work bounty ${Date.now()}`,
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'We are testing Proo of Work',
    amount: '123',
    assign: assignee,
    deliverables: 'Ensure you sumit a valid proof of work',
    tribe: '',
    estimate_session_length: '3 hours',
    estimate_completion_date: '09/09/2025'
  };
  const bountyCreator = 'alice';
  const proofText = 'Proof text here';

  it('should sign in and submit proof successfully', () => {
    /**
     * Steps to be taken by bounty creator
     * Owner of the bounty login
     * Create Bounty
     * Assign Bounty
     * Logs out
     */
    cy.login(bountyCreator);
    cy.create_bounty(bounty);
    cy.contains('Filter').click();
    cy.contains('Assigned').click();
    cy.contains(bounty.title).click();
    cy.contains('Copy Link').click();
    cy.get('[data-testid="close-btn"]').click();
    cy.logout(bountyCreator);
    /**
     * Steps for the user who is assigned bounty
     * Login
     * Go to bounty page
     * click on the bounty link
     * Submit Proof of work
     * Logs out
     */
    cy.login(assignee);
    cy.window()
      .then((win) => {
        return win.navigator.clipboard.readText();
      })
      .then((copiedText) => {
        cy.visit(copiedText);
        cy.contains('Submit Proof').click();
        cy.get('textarea[aria-label="Enter your proof"]').type(proofText);
        cy.get('[data-testid="submit-proof-handler"]').click();
        cy.contains('Proof of work submitted successfully').should('be.visible');
        cy.get('[data-testid="close-btn"]').click();
        cy.logout(assignee);
      });
  });
});
