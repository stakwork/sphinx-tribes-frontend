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

    // Open the first bounty on the page
    cy.contains('My new Bounty').click();

    // Click on the edit button
    cy.contains('Edit').click();

    // Edit the bounty title and description
    const newTitle = 'Edited Bounty Title';
    const newDescription = 'This bounty has been edited';
    cy.get('[data-testid="EditTitle"]').clear().type(newTitle);
    cy.get('[data-testid="EditDescription"]').clear().type(newDescription);

    // Save the changes
    cy.contains('Save Changes').click();

    // Assert that the new bounty title and description match what was edited
    cy.contains(newTitle).should('exist');
    cy.contains(newDescription).should('exist');
  });
});
