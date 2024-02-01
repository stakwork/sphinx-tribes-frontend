describe('Alice tries to create a bounty', () => {
  it('Create a bonty', () => {
    let activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    cy.create_bounty({
      title: 'My new Bounty',
      category: 'Web development',
      github_issue_url: '',
      coding_language: ['Lightning'],
      description: 'This is available',
      amount: '123',
      assign: '',
      deliverables: '',
      tribe: '',
      estimate_session_length: '',
      estimate_completion_date: '02/01/2024',
      organization: ''
    });

    cy.wait(1000);
    cy.logout(activeUser);
  });
});
