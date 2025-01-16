describe('filter by status for org bounty', () => {
  it('should filter bounties according to the status selected', () => {
    const workspaceName = 'E2EWorkspace3';

    const workspace: Cypress.Workspace = {
      loggedInAs: 'bob',
      name: workspaceName,
      description: 'A workspace focused on amazing projects.',
      website: 'https://amazing.org',
      github: 'https://github.com/amazing'
    };

    cy.login(workspace.loggedInAs);
    cy.wait(1000);

    cy.create_workspace(workspace);
    cy.wait(1000);

    const bounty1: Cypress.Bounty = {
      workspace: workspaceName,
      title: 'Bounty1(open)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Workspace Tribe',
      estimate_session_length: '3 hours',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: ''
    };

    const bounty2: Cypress.Bounty = {
      workspace: workspaceName,
      title: 'Bounty2(open)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Workspace Tribe',
      estimate_session_length: '3 hours',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: ''
    };

    const bounty3: Cypress.Bounty = {
      workspace: workspaceName,
      title: 'Bounty3(open)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Workspace Tribe',
      estimate_session_length: '3 hours',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: ''
    };

    const bounty4: Cypress.Bounty = {
      workspace: workspaceName,
      title: 'Bounty4(Assigned)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Workspace Tribe',
      estimate_session_length: '3 hours',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'carol'
    };

    const bounty5: Cypress.Bounty = {
      workspace: workspaceName,
      title: 'Bounty5(Assigned)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Workspace Tribe',
      estimate_session_length: '3 hours',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'alice'
    };

    const bounty6: Cypress.Bounty = {
      workspace: workspaceName,
      title: 'Bounty6(Assigned)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Workspace Tribe',
      estimate_session_length: '3 hours',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'carol'
    };

    const bounty7: Cypress.Bounty = {
      workspace: workspaceName,
      title: 'Bounty7(paid)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Workspace Tribe',
      estimate_session_length: '3 hours',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'carol'
    };

    const bounty8: Cypress.Bounty = {
      workspace: workspaceName,
      title: 'Bounty8(paid)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Workspace Tribe',
      estimate_session_length: '3 hours',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'alice'
    };

    cy.create_bounty(bounty1);
    cy.wait(1000);

    cy.contains(bounty1.title);
    cy.wait(5000);

    cy.contains(workspace.name);
    cy.wait(1000);

    cy.contains(workspace.name).invoke('removeAttr', 'target').click({ force: true });
    cy.wait(5000);

    cy.url().should('include', '/workspace/bounties');
    cy.wait(5000);

    cy.create_workspace_bounty(bounty2);
    cy.wait(1000);

    cy.create_workspace_bounty(bounty3);
    cy.wait(1000);

    cy.contains('Status').first().click();
    cy.wait(1000);

    cy.contains('label', 'Open').click();
    cy.wait(1000);

    cy.contains(bounty1.title);
    cy.wait(1000);

    cy.contains(bounty2.title);
    cy.wait(1000);

    cy.contains(bounty3.title);
    cy.wait(1000);

    cy.contains('label', 'Open').click();
    cy.wait(1000);

    cy.create_workspace_bounty(bounty4);
    cy.wait(1000);

    cy.create_workspace_bounty(bounty5);
    cy.wait(1000);

    cy.create_workspace_bounty(bounty6);
    cy.wait(1000);

    cy.contains('Status').first().click();
    cy.wait(1000);

    cy.contains('label', 'Assigned').click();
    cy.wait(1000);

    cy.contains(bounty4.title);
    cy.wait(1000);

    cy.contains(bounty5.title);
    cy.wait(1000);

    cy.contains(bounty6.title);
    cy.wait(1000);

    cy.create_workspace_bounty(bounty7);
    cy.wait(1000);

    cy.create_workspace_bounty(bounty8);
    cy.wait(1000);

    cy.contains('Status').first().click();
    cy.wait(1000);

    cy.contains('label', 'Assigned').click();
    cy.wait(1000);

    cy.contains(bounty7.title).click();
    cy.wait(1000);

    cy.contains('Mark as Paid').click();
    cy.wait(1000);

    cy.contains('Next').click();
    cy.wait(1000);

    cy.contains('Skip and Mark Paid').click();
    cy.wait(1000);

    cy.contains('paid');

    cy.get('body').click(0, 0);
    cy.wait(1000);

    cy.contains(bounty8.title).click();
    cy.wait(1000);

    cy.contains('Mark as Paid').click();
    cy.wait(1000);

    cy.contains('Next').click();
    cy.wait(1000);

    cy.contains('Skip and Mark Paid').click();
    cy.wait(1000);

    cy.contains('paid');

    cy.get('body').click(0, 0);
    cy.wait(1000);

    cy.contains('Status').first().click();
    cy.wait(1000);

    cy.contains('label', 'Paid').click();
    cy.wait(1000);

    cy.contains(bounty7.title);
    cy.wait(1000);

    cy.contains(bounty8.title);
    cy.wait(1000);

    cy.contains('label', 'Paid').click();
    cy.wait(1000);

    cy.contains('Status').first().click();
    cy.wait(1000);

    cy.logout(workspace.loggedInAs);
  });
});
