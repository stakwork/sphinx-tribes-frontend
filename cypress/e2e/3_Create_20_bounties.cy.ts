describe('Alice tries to create 20 bounties', () => {
  it('Create 20 bounties', () => {
    let activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    cy.create_bounty({
      title: 'Title 1',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 2',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 3',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 4',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 5',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 6',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 7',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 8',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 9',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 10',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 11',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 12',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 13',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 14',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 15',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 16',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 17',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 18',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 19',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.create_bounty({
      title: 'Title 20',
      category: 'Web development',
      coding_language: ['Typescript'],
      description: 'Lorem Ipsum Dolor',
      amount: '10000',
      assign: 'carol',
      deliverables: 'We are good to go man',
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    });

    cy.wait(1000);

    cy.logout(activeUser);
  });
});
