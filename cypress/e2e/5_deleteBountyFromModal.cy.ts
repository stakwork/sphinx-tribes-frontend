describe('Can Delete Bounty From Modal', () => {
  const bounty: Cypress.Bounty = {
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

  it('Can delete a bounty from modal', () => {
    const activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

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

    cy.logout(activeUser);
  });
});
