describe('Alice tries to create a bounty on the user profile page and view them', () => {
  it('Create view bounties user profile page', () => {
    let activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    cy.contains(activeUser).click();
    cy.wait(1000);

    for (let i = 1; i <= 2; i++) {
      cy.create_bounty(
        {
          title: `Bounty Title ${i}`,
          category: 'Web development',
          coding_language: ['Typescript'],
          description: 'Lorem Ipsum Dolor',
          amount: '10000',
          deliverables: 'We are good to go man',
          tribe: '',
          estimate_session_length: 'Less than 3 hour',
          estimate_completion_date: '09/09/2024'
        },
        'testId'
      );
    }

    cy.wait(1000);

    cy.contains(`Open`).click();
    cy.wait(1000);

    for (let i = 1; i <= 2; i++) {
      cy.contains(`Bounty Title ${i}`).click();
    }
    cy.wait(1000);

    // click outside the modal
    cy.get('body').click(0, 0);

    cy.logout(activeUser);
  });
});
