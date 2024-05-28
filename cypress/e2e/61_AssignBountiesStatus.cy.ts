describe('Verify Bounty Status Consistency', () => {
  const assignee = 'carol';
  const bounty: Cypress.Bounty = {
    title: 'Ali Bounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '123',
    assign: assignee,
    deliverables: 'We are good to go man',
    tribe: '',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '09/09/2024'
  };

  it('Should display consistent bounty status in list and details views', () => {
    const activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.wait(600);
    cy.contains('Assigned').click();
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.contains('Complete Bounty').click();
    cy.wait(1000);

    // Verify status in details view
    cy.contains('completed').should('exist');
    cy.wait(1000);

    cy.get('body').click(0, 0);

    cy.contains(activeUser).click();
    cy.wait(1000);

    cy.get('[data-testid="Bounties-tab"]').click();
    cy.wait(1000);

    // Verify status in list view
    cy.contains(bounty.title).should('exist');
    cy.contains('Complete').should('exist');

    cy.wait(1000);
    cy.logout(activeUser);
  });
});
