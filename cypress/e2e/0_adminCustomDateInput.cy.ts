describe('Admin Custom Date Input', () => {
  const activeUser = 'alice';

  const bounty: Cypress.Bounty = {
    title: 'Admin',
    category: 'Web development',
    description: 'This is available',
    amount: '123',
    assign: 'carol',
    deliverables: 'We are good to go man'
  };

  const today = new Date();
  const startDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today
    .getDate()
    .toString()
    .padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;

  const endDate = new Date(today.getTime());
  endDate.setDate(today.getDate() + 1);

  const endDateFormatted = `${(endDate.getMonth() + 1).toString().padStart(2, '0')}/${endDate
    .getDate()
    .toString()
    .padStart(2, '0')}/${endDate.getFullYear().toString().slice(-2)}`;

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

    cy.contains('22');
    cy.contains('Bounties');

    cy.contains('Last 7 Days').click();
    cy.contains('Custom').click();

    cy.get('input[placeholder="MM/DD/YY"]').eq(0).clear().type(startDate);

    cy.get('input[placeholder="MM/DD/YY"]').eq(1).clear().type(endDateFormatted);

    cy.contains('Save').click();
    cy.wait(2000);

    cy.contains('22');
    cy.contains('Bounties');

    const [startDay, , startMonth, startYear] = startDate.split(', ');
    const [endDay, , endMonth] = endDateFormatted.split(', ');

    const expectedDateRange = `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear.slice(-2)}`;

    cy.get('[data-testid="month"]').should('contain', expectedDateRange);

    cy.logout(activeUser);
  });
});
