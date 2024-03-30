describe('Admin Custom Date Input', () => {
  const activeUser = 'alice';
  let startDate: Date;
  let endDate: Date;

  const bounty: Cypress.Bounty = {
    title: 'Admin',
    category: 'Web development',
    description: 'This is available',
    amount: '123',
    assign: 'carol',
    deliverables: 'We are good to go man'
  };

  beforeEach(() => {
    cy.login(activeUser);
    cy.wait(1000);
  });

  it('should create 22 bounties, navigate to admin page, and assert custom date input functionality', () => {
    for (let i = 1; i <= 4; i++) {
      const updatedBounty = { ...bounty, title: `Admin${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/admin');
    cy.wait(3000);

    cy.contains('Bounties').should('contain.text', 'Bounties').and('contain.text', '22');

    cy.contains('Last 7 Days').click();
    cy.contains('Custom').click();

    cy.get('input[placeholder="MM/DD/YY"]')
      .eq(0)
      .clear()
      .type(startDate.toISOString().substring(0, 10));

    cy.get('input[placeholder="MM/DD/YY"]')
      .eq(1)
      .clear()
      .type(endDate.toISOString().substring(0, 10));

    cy.contains('Save').click();
    cy.wait(2000);

    cy.contains('Bounties').should('contain.text', 'Bounties').and('contain.text', '22');

    const formattedStartDate = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const formattedEndDate = endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const expectedDateRange = `${formattedStartDate} - ${formattedEndDate}`;
    cy.get('.date-range').should('contain.text', expectedDateRange);

    cy.logout(activeUser);
  });
});
