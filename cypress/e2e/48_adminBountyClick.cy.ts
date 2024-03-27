describe('Super Admin Bounty Creation and Verification', () => {
  let activeUser = 'alice';

  const bounty: Cypress.Bounty = {
    title: 'saithsab',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '844',
    deliverables: 'I can submit a pr within 2 days of taking the bounty',
    tribe: '',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '09/09/2024'
  };

  beforeEach(() => {
    cy.login(activeUser);
    cy.wait(1000);
  });

  it('Should create six bounties, navigate to the Admin page, verify the second bounty, and logout', () => {
    for (let i = 1; i <= 3; i++) {
      const updatedBounty = { ...bounty, title: `saithsab${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/admin');
    cy.wait(3000);

    cy.contains(`saithsab2`).invoke('removeAttr', 'target').click({ force: true });
    cy.wait(2000);

    cy.get('[data-testid="owner_name"]').contains(activeUser).should('exist');
    cy.wait(1000);

    cy.contains('saithsab2').should('exist');
    cy.wait(1000);

    cy.contains(bounty.description).should('exist');
    cy.wait(1000);

    cy.contains(bounty.deliverables).should('exist');
    cy.wait(1000);

    cy.contains(bounty.amount).should('exist');
    cy.wait(1000);

    cy.contains('Estimate:').should('exist');
    cy.contains('< 3 hrs').should('exist');
    cy.wait(1000);

    cy.contains('Copy Link').should('exist');
    cy.wait(600);

    cy.contains('Share to Twitter').should('exist');
    cy.wait(600);

    cy.contains('Mark as Paid').should('exist');
    cy.wait(600);

    cy.get('body').click(0, 0);
    cy.wait(600);
    cy.logout(activeUser);
  });
});
