describe('Alice tries to create a bounty', () => {
  it('Create a bounty', () => {
    let activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    cy.create_bounty({
      title: 'My new Bounty',
      category: 'Web development',
      // github_issue_url: 'https://github.com/stakwork/sphinx-relay/issues/799',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
      // organization: 'Testing Org'
    });

    cy.wait(1000);

    cy.logout(activeUser);
  });
});
