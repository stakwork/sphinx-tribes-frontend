describe('Alice tries to assign a hunter after creating a bounty', () => {
  const bounty: Cypress.Bounty = {
    title: 'My new Bounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '123',
    assign: '',
    deliverables: 'We are good to go man',
    tribe: '',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '09/09/2024'
  };

  const assignee = 'carol';

  it('Create a bounty without assignee', () => {
    let activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.contains('Not Assigned').click();
    cy.wait(1000);

    cy.get('.SearchInput').type(assignee);
    cy.get('.People').contains('Assign').click();
    cy.wait(1000);

    cy.contains(assignee);

    // click outside the modal
    cy.get('body').click(0, 0);

    cy.logout(activeUser);
  });
});
