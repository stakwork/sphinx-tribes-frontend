describe('Alice tries to Mark a Bounty as paid after creating a bounty', () => {
  const assignee = 'carol';

  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Workspace8',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };


  const bounty: Cypress.Bounty = {
    workspace:'Workspace8',
    title: 'My new Bounty for unapaid user',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is a description',
    amount: '1000',
    assign: assignee,
    deliverables: 'Just get it done',
    tribe: '',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '12/12/2024'
  };

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
  });

  it('Create a bounty with an assignee then Mark as paid ', () => {

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.contains('Assigned').click();
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.contains('Mark as Paid').click();
    cy.wait(1000);

    cy.contains('Next').click();
    cy.wait(1000);

    cy.contains('Skip and Mark Paid').click();
    cy.wait(1000);

    cy.contains('paid');

    // click outside the modal
    cy.get('body').click(0, 0);

    cy.logout(workspace.loggedInAs);
  });
});
