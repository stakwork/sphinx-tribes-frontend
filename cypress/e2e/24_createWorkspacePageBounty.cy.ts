describe('Create org bounty from WorkSpace Page', () => {
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

  it('should verify  bounty tile displays the workspace label is clickable and redirects the user to the workspaces bounty page and create a new bounty', () => {
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

    cy.logout(workspace.loggedInAs);
  });
});
