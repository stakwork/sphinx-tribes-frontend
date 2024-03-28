describe('Admin Statistics Custom Date Range', () => {
  let activeUser = 'alice';

  const bounty: Cypress.Bounty = {
    title: 'UmerTask',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '123'
  };

  beforeEach(() => {
    cy.login(activeUser);
    cy.wait(1000);
  });

  it('Creates 25 bounties, navigates to Admin page, and verifies bounties count and visibility', () => {
    for (let i = 1; i <= 25; i++) {
      const updatedBounty = { ...bounty, title: `UmerTask${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/admin');
    cy.wait(3000);

    for (let i = 25; i >= 6; i--) {
      cy.contains(`UmerTask${i}`, { timeout: 10000 }).should('exist');
    }

    cy.contains('25').should('exist');
    cy.wait(1000);

    cy.get('[data-testid="DropDown"]').click();
    cy.contains('li', 'Custom').click();
    cy.wait(1000);

    cy.get('input[name="start"]').type('03/01/24');
    cy.wait(600);

    cy.get('input[name="end"]').type('03/28/24');
    cy.wait(600);

    cy.contains('Save').click();
    cy.wait(1000);

    cy.contains('25').should('exist');
    cy.wait(1000);

    cy.get('[data-testid="month"]').contains('01 Mar - 28 Mar 2024');
    cy.wait(600);

    cy.logout(activeUser);
  });
});
