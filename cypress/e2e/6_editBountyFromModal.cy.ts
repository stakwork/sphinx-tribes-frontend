describe('Edit Bounty From Modal', () => {
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

    cy.contains('Filter').click();
    cy.contains('Assigned').click();
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.contains('Edit').click();
    cy.wait(1000);

    const newTitle = 'Edited Bounty Title';
    const newDescription = 'This bounty has been edited';

    cy.get('.inputText').clear({ force: true }).type(newTitle);
    cy.wait(1000);
    cy.get('[data-testid="checktextarea"]').clear().type(newDescription);
    cy.wait(1000);

    cy.contains('Save').click();
    cy.wait(1000);
    cy.contains(newTitle).should('exist');
    cy.contains(newDescription).should('exist');
  });
});
