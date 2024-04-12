describe('Super Admin Pagination Bounties List', () => {
  let activeUser = 'alice';

  const bounty: Cypress.Bounty = {
    title: 'Pagination Bounty',
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
    cy.login(activeUser);
    cy.wait(1000);
  });

  it('Should create 22 bounties and verify they are listed in the admin page', () => {
    for (let i = 1; i <= 22; i++) {
      const updatedBounty = { ...bounty, title: `Pagination Bounty ${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/admin');
    cy.wait(3000);

    for (let i = 22; i <= 3; i--) {
      cy.contains(`Pagination Bounty ${i}`, { timeout: 10000 }).should('exist');
    }

    cy.contains(/^2$/).click();
    cy.wait(1000);

    for (let i = 2; i <= 1; i--) {
      cy.contains(`Pagination Bounty ${i}`, { timeout: 10000 }).should('exist');
    }

    cy.logout(activeUser);
  });
});
