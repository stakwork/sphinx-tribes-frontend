describe('Alice tries to unassign a hunter after creating a bounty', () => {
  const assignee = 'carol';

  const bounty: Cypress.Bounty = {
    title: 'My new Bounty',
    workspace:'workspace7',
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

  it('Create a bounty with an assignee then unassign the user', () => {
    let activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    cy.create_workspace({
      loggedInAs: 'carol',
      name: 'workspace7',
      description: 'We are testing out our workspace',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    });

    cy.wait(1000);

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.contains('Assigned').click();
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.contains(assignee);

    cy.get('[data-testid="edit-btn"]').click();
    cy.wait(1000);

    cy.contains('Not Assigned');

    // click outside the modal
    cy.get('body').click(0, 0);

    cy.logout(activeUser);
  });
});
