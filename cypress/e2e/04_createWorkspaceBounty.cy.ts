describe('User creates a bounty attached to a workspace', () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Alice Workspace',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace: 'Alice Workspace',
    title: 'Alice Bounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '123',
    tribe: 'Amazing Workspace Tribe',
    estimate_session_length: '3 hours',
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

  it('should verify the bounty tile has the org label and is clickable', () => {
    cy.create_bounty(bounty);
    cy.wait(2000);

    cy.contains(bounty.title);
    cy.wait(1000);

    cy.contains(workspace.name).click();

    cy.logout(workspace.loggedInAs);
  });
});
