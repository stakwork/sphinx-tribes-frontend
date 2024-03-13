describe('Edit Bounty From Modal', () => {
  it('Can edit a bounty from modal', () => {
    cy.create_bounty({
      title: 'My new Bounty',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.contains('My new Bounty').click();
    cy.contains('Edit').click();

    const newTitle = 'Edited Bounty Title';
    const newDescription = 'This bounty has been edited';

    cy.get('[data-testid="one_sentence_summary"]').clear().type(newTitle);
    cy.get('[data-testid="description"]').clear().type(newDescription);

    cy.contains('Save Changes').click();
    cy.contains(newTitle).should('exist');
    cy.contains(newDescription).should('exist');
  });
});
