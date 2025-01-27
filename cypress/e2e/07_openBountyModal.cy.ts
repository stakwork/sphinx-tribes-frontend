describe('View Bounty From Modal', () => {
  const bounty: Cypress.Bounty = {
    title: 'Ali Bounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '844',
    assign: 'carol',
    deliverables: 'I can submit a pr within 2 days of taking the bounty',
    tribe: '',
    estimate_session_length: '3 hours',
    estimate_completion_date: '09/09/2024'
  };

  it('Should view the bounty modal after creating', () => {
    const activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.wait(600);
    cy.contains('Open').click();
    cy.contains('Assigned').click();
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.get('[data-testid="owner_name"]').contains(activeUser).should('exist');
    cy.wait(1000);

    cy.contains(bounty.title).should('exist');
    cy.wait(1000);

    cy.contains(bounty.description).should('exist');
    cy.wait(1000);

    cy.contains(bounty.deliverables).should('exist');
    cy.wait(1000);

    cy.contains(bounty.assign).should('exist');
    cy.wait(1000);

    cy.contains(bounty.amount).should('exist');
    cy.wait(1000);

    cy.contains('Estimate:').should('exist');
    cy.contains('3 hours').should('exist');
    cy.wait(1000);

    cy.contains('Copy Link').should('exist');
    cy.wait(600);

    cy.contains('Share to Twitter').should('exist');
    cy.wait(600);

    cy.contains('Mark as Paid').should('exist');
    cy.wait(600);

    cy.contains('Pay Bounty').should('exist');
    cy.wait(1000);

    cy.get('body').click(0, 0);
    cy.logout(activeUser);
  });
});
