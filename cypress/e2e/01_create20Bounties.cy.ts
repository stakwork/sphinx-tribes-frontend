describe('Alice tries to create 20 bounties', () => {
  it('Create 20 bounties', () => {
    let activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    for (let i = 1; i <= 20; i++) {
      cy.create_bounty({
        title: `Title ${i}`,
        category: 'Web development',
        coding_language: ['Typescript'],
        description: 'Lorem Ipsum Dolor',
        amount: '10000',
        assign: 'carol',
        deliverables: 'We are good to go man',
        tribe: '',
        estimate_session_length: '3 hours',
        estimate_completion_date: '09/09/2024'
      });
    }

    cy.wait(1000);

    cy.logout(activeUser);
  });
});
