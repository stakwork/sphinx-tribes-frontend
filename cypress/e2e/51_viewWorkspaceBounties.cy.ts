describe('View Workspace Bounties', () => {
  const WorkspaceName = 'WorkspaceView';

  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: WorkspaceName,
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace: WorkspaceName,
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

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
  });

  it('should verify  bounty tile displays the workspace label is clickable and redirects the user to the workspaces bounty page.', () => {
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

    cy.contains(bounty.title).should('exist');
    cy.wait(1000);

    cy.logout(workspace.loggedInAs);
  });
});
