describe('Alice tries to unassign a hunter after creating a bounty', () => {
  const assignee = 'carol';

  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Workspace7',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };


  const bounty: Cypress.Bounty = {
    workspace:'Workspace7',
    title: 'My new Bounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '123',
    assign: assignee,
    deliverables: 'We are good to go man',
    tribe: '',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '09/09/2024'
  };

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
  });


  it('Create a bounty with an assignee then unassign the user', () => {
    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.contains('Assigned').click();
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.contains(assignee);

    cy.get('[data-testid="edit-btn"]').click();
    cy.wait(1000);

    cy.contains('Not Assigned');

    // click outside the modal
    cy.get('body').click(0, 0);

    cy.logout(workspace.loggedInAs);
  });
});
