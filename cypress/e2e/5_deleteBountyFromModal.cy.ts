describe('Can Delete Bounty From Modal', () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Workspace3',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace:'Workspace3',
    title: 'Ali Bounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '123',
    tribe: 'Amazing Workspace Tribe',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '09/09/2024',
    deliverables: 'We are good to go man'
  };


  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
  });

  it('Can delete a bounty from modal', () => {

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.contains('Delete').click();
    cy.wait(1000);

    cy.get('.euiButton').contains('Delete').click({ force: true });
    cy.wait(1000);

    cy.contains('Your Bounty is Successfully Deleted');
    cy.wait(600);

    cy.visit('http://localhost:3007/bounties');
    cy.wait(1000);

    cy.contains(bounty.title).should('not.exist');
    cy.get('body').click(0, 0);

    cy.logout(workspace.loggedInAs);
  });
});
