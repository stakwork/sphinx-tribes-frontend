describe('User Journey through Sphinx Chat Bounties and Workspace', () => {
  const userAlias = 'alice'; // Assuming 'alice' is the user alias for login

  it('User navigates through the Sphinx Chat platform', () => {
    // Step 1: Navigate to the Bounties page
    cy.visit('https://community.sphinx.chat/bounties');

    // Step 2: User clicks on "Sign in" button
    cy.contains('Sign in').click();

    // Step 3: User clicks on "Login with Sphinx" button
    cy.contains('Login with Sphinx').click();

    // Step 4: User is redirected to a challenge URL
    cy.url().should('include', 'challenge');

    // Step 5: User clicks on a button in the modal
    cy.get('button.euiButton--primary').click();

    // Step 6: User navigates back to the Bounties page
    cy.url().should('eq', 'https://community.sphinx.chat/bounties');

    // Step 7: User clicks on "Bounties Platform" link
    cy.contains('Bounties Platform').click();

    // Step 8: User navigates to the Workspace page
    cy.url().should('include', '/workspace/ck95pe04nncjnaefo08g');

    // Step 9: User clicks on "Workspace Planner" button
    cy.get('[data-testid="workspace-planner-btn"]').click();

    // Step 10: User navigates to the Planner page
    cy.url().should('include', '/planner');

    // Step 11: User clicks on "Unit Tests: UpdateFeatureFlag"
    cy.contains('Unit Tests: UpdateFeatureFlag').click();

    // Step 12: User clicks on "Sign out" button
    cy.contains('Sign out').click();

    // Step 13: User navigates back to the Bounties page
    cy.url().should('eq', 'https://community.sphinx.chat/bounties');

    // Step 14: User returns to the homepage
    cy.visit('https://community.sphinx.chat/');

    // Step 15: User clicks on "Sign in" button again
    cy.contains('Sign in').click();

    // Step 16: User clicks on "Login with Sphinx" button again
    cy.contains('Login with Sphinx').click();

    // Step 17: User is redirected to another challenge URL
    cy.url().should('include', 'challenge');

    // Step 18: User navigates to the Workspaces page
    cy.visit('https://community.sphinx.chat/p/undefined/workspaces');

    // Step 19: User clicks on "Bounties Platform" link again
    cy.contains('Bounties Platform').click();

    // Step 20: User navigates to the Workspace page again
    cy.url().should('include', '/workspace/ck95pe04nncjnaefo08g');

    // Step 21: User clicks on "Workspace Planner" button again
    cy.get('[data-testid="workspace-planner-btn"]').click();

    // Step 22: User navigates to the Planner page again
    cy.url().should('include', '/planner');

    // Step 23: User clicks on "Complete Bounty" button
    cy.contains('Complete Bounty').click();

    // Step 24: User clicks on "Pay Bounty" button
    cy.contains('Pay Bounty').click();

    // Step 25: User clicks on a button in the modal
    cy.get('button.euiButton--primary').click();

    // Step 26: User closes the modal
    cy.get('img[alt="close_svg"]').click();

    // Step 27: User navigates back to the Planner page
    cy.url().should('include', '/planner');

    // Step 28: User clicks on a button to navigate to Workspaces
    cy.get('button.euiButton--primary').click();

    // Step 29: User navigates back to the Bounties page
    cy.url().should('eq', 'https://community.sphinx.chat/bounties');
  });
});
