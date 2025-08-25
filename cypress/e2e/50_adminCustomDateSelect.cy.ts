describe('Admin Statistics Custom Date Range', () => {
  let activeUser = 'alice';

  const bounty: Cypress.Bounty = {
    title: 'UmerJobs',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '123'
  };

  it('Creates 25 bounties, navigates to Admin page, and verifies bounties count and visibility', () => {
    cy.login(activeUser);
    cy.wait(3000);

    for (let i = 1; i <= 25; i++) {
      const updatedBounty = { ...bounty, title: `UmerJobs${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/admin');
    cy.wait(3000);

    for (let i = 25; i >= 6; i--) {
      cy.contains(`UmerJobs${i}`, { timeout: 10000 }).should('exist');
    }

    cy.contains('25').should('exist');
    cy.wait(1000);

    cy.get('[data-testid="DropDown"]').click();
    cy.contains('li', 'Custom').click();
    cy.wait(1000);

    const startDate = new Date();
    startDate.setDate(1);
    const endDate = new Date();

    const formatStartDate = startDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    const formatEndDate = endDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });

    cy.get('input[name="start"]').clear().type(formatStartDate);
    cy.get('input[name="end"]').clear().type(formatEndDate);
    cy.contains('Save').click();
    cy.wait(1000);

    cy.contains('25').should('exist');
    cy.wait(1000);

    let expectedStartDateFormat = `${String(startDate.getDate()).padStart(
      2,
      '0'
    )} ${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()}`;

    const expectedEndDateFormat = `${String(endDate.getDate()).padStart(
      2,
      '0'
    )} ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getFullYear()}`;

    const expectedDateRange = `${expectedStartDateFormat} - ${expectedEndDateFormat}`;

    cy.get('[data-testid="month"]').should('have.text', expectedDateRange);

    cy.logout(activeUser);
  });
});
