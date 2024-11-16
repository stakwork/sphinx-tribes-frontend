describe('Alice tries to create 20 bounties', () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Workspace2',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
  });

  it('Create 20 bounties', () => {

    for (let i = 1; i <= 20; i++) {
      cy.create_bounty({
        workspace:'Workspace2',
        title: `Title ${i}`,
        category: 'Web development',
        coding_language: ['Typescript'],
        description: 'Lorem Ipsum Dolor',
        amount: '10000',
        assign: 'carol',
        deliverables: 'We are good to go man',
        tribe: '',
        estimate_session_length: 'Less than 3 hour',
        estimate_completion_date: '09/09/2024'
      });
    }

    cy.wait(1000);

    cy.logout(workspace.loggedInAs);
  });
});
