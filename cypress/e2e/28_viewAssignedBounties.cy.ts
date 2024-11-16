describe('View User Assigned Bounties', () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'carol',
    name: 'Workspace11',
    description: 'A workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };


  const bounty: Cypress.Bounty = {
    workspace:'Workspace11',
    title: 'Syed Bounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '123',
    tribe: 'Amazing Workspace Tribe',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '09/09/2024',
    deliverables: 'We are good to go man',
    assign: 'alice'
  };

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
  });

  it('Should create three bounties and assigned to a user', () => {
    for (let i = 1; i <= 3; i++) {
      const updatedBounty = { ...bounty, title: `Syed Bounty${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/p');
    cy.wait(1000);

    cy.get('input').type('alice');
    cy.wait(1000);

    cy.contains('alice').click();
    cy.wait(1000);

    cy.contains('Assigned Bounties').click();
    cy.wait(1000);

    for (let i = 1; i <= 3; i++) {
      cy.contains(`Syed Bounty${i}`, { timeout: 10000 }).should('exist');
    }

    cy.get('body').click(0, 0);
    cy.logout(workspace.loggedInAs);
  });
});
