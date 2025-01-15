describe('User submits proof after signing in', () => {
    const userAlias = 'alice'; // Assuming 'alice' is the user alias for login

    const WorkSpaceName = 'Ali SoftDev';
 
    const workspace: Cypress.Workspace = {
      loggedInAs: 'alice',
      name: WorkSpaceName,
      description: 'A workspace focused on amazing projects.',
      website: 'https://amazing.org',
      github: 'https://github.com/amazing'
    };
 
    const bounty: Cypress.Bounty = {
      workspace: WorkSpaceName,
      title: 'Bounty',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Workspace Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: ''
    };
 
    const workspacePageBounty: Cypress.Bounty = {
      title: 'Test#2',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Workspace Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: ''
    };
 
    beforeEach(() => {
      cy.login(workspace.loggedInAs);
      cy.wait(1000);
      cy.contains(workspace.loggedInAs).click();
      cy.wait(1000);
      cy.create_workspace(workspace);
      cy.wait(1000);
    });


    it('should allow the user to submit proof after signing in', () => {
						cy.create_bounty(bounty);
      cy.wait(5000);
 
      cy.contains(bounty.title);
      cy.wait(5000);
 
      cy.contains(workspace.name);
      cy.wait(1000);
 
      cy.contains(workspace.name).invoke('removeAttr', 'target').click({ force: true });
      cy.wait(5000);
 
      cy.url().should('include', '/workspace/bounties');
      cy.wait(5000);
 
      cy.contains('Post a Bounty').click();
      cy.contains('Start').click();
 
      cy.get('[data-testid="Workspace"]').contains(workspace.name).should('exist').and('be.visible');
      cy.wait(1000);
 
      cy.get('[data-testid="close-btn"]').click();
      cy.wait(1000);
 
      cy.create_workspace_bounty(workspacePageBounty);
      cy.wait(5000);
 
      cy.contains(workspacePageBounty.title).should('exist').and('be.visible');
      cy.wait(5000);

 //==================
        //cy.visit('https://community.sphinx.chat/p/c56elnatu2rs7hq5hkb/assigned/3324/0');

        // Modal Interaction
        cy.get('[data-testid="close-btn"]').click();

        // Navigation to Another Page
        cy.get('[data-testid="user-personal-bounty-card"]').click();

        // Return to Previous Page
        cy.go('back');

        // Modal Interaction Again
        cy.get('[data-testid="close-btn"]').click();

        // Button Click - Sign In
        cy.contains('Sign In').click();
        cy.login(userAlias);

        // Submit Proof Interaction
        cy.contains('Submit Proof').click();

        // Textarea Interaction
        cy.get('textarea[aria-label="Enter your proof"]').type('Proof text here');

        // Submit Proof Confirmation
        cy.contains('Submit Proof').click();

        // Verifying proof submission success
        // Assuming there's a success message or state change to verify
        cy.contains('Proof submitted successfully').should('be.visible');

        // Cleanup
        cy.logout(userAlias);
    });
});
