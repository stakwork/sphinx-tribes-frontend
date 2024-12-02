describe('Alice tries to assign a hunter after creating a bounty', () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Workspace6',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace:'Workspace6',
    title: 'My new Bounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '123',
    assign: '',
    deliverables: 'We are good to go man',
    tribe: '',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '09/09/2024'
  };

  const assignee = 'carol';

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
  });


  it('Creates a bounty without assignee', () => {
    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.contains('Not Assigned').click();
    cy.wait(1000);

    cy.get('.SearchInput').type(assignee);
    cy.get('.People').contains('Assign').click();
    cy.wait(1000);

    cy.contains(assignee);

    // click outside the modal
    cy.get('body').click(0, 0);

    cy.logout(workspace.loggedInAs);
  });
});
