describe('Signed Out Post Bounty Flow ', () => {
  let activeUser = 'carol';

  const bounty: Cypress.Bounty = {
    title: 'Syed Bounty',
    category: 'Web development',
    description: 'This is available',
    amount: '12',
    tribe: 'Amazing Workspace Tribe',
    deliverables: 'We are good to go man'
  };

  it('Validates sign-in requirements for posting a bounty, including modal display, signing in, and creating a bounty', () => {
    cy.visit('http://localhost:3007/bounties');
    cy.wait(1000);

    cy.contains('Post a Bounty').click();
    cy.wait(1000);

    cy.contains('Sign in').click({ force: true });
    cy.wait(1000);

    cy.haves_phinx_login(activeUser);
    cy.wait(1000);

    cy.visit('http://localhost:3007/bounties');
    cy.wait(1000);

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains(bounty.title).should('exist');
    cy.wait(1000);

    cy.logout(activeUser);
  });
});
