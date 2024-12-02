describe('Signed Out Post Bounty Flow ', () => {

  const workspace: Cypress.Workspace = {
    loggedInAs: 'carol',
    name: 'Workspace14',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace:'Workspace14',
    title: 'Syed Bounty',
    category: 'Web development',
    description: 'This is available',
    amount: '12',
    tribe: 'Amazing Workspace Tribe',
    deliverables: 'We are good to go man'
  };

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
    cy.logout(workspace.loggedInAs);
    cy.wait(1000);
  });

  it('Validates sign-in requirements for posting a bounty, including modal display, signing in, and creating a bounty.', () => {
    cy.visit('http://localhost:3007/bounties');
    cy.wait(1000);

    cy.contains('Post a Bounty').click();
    cy.wait(1000);

    cy.contains('Sign in').click({ force: true });
    cy.wait(1000);

    cy.haves_phinx_login(workspace.loggedInAs);
    cy.wait(1000);

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains(bounty.title).should('exist');
    cy.wait(1000);

    cy.logout(workspace.loggedInAs);
  });
});
