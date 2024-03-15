describe('View bounty modal', () => {
  const assignee = 'carol';
  const bounty: Cypress.Bounty = {
    title: 'My new Bounty',
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

  it('Can edit a bounty from modal', () => {
    const activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);


    cy.contains(activeUser);
    cy.wait(1000);

    cy.contains(bounty.title);
    cy.wait(1000);

    cy.contains(bounty.assign);
    cy.wait(1000);

    cy.contains(bounty.amount);
    cy.wait(1000);

    cy.contains(bounty.estimate_completion_date);
    cy.wait(1000);

    cy.contains(bounty.deliverables);
    cy.wait(1000);

    cy.contains(bounty.description);
    cy.wait(1000);

    cy.contains('Mark as Paid');
    cy.wait(1000);

    cy.contains('Copy Link');
    cy.wait(1000);

    cy.contains('Share to Twitter');
    cy.wait(1000);
  });
});
