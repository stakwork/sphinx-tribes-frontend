describe('Edit Bounty From Modal', () => {
  const assignee = 'carol';
  const bounty: Cypress.Bounty = {
    title: 'My new Bounty',
    workspace:'workspace4',
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

    cy.create_workspace({
      loggedInAs: 'carol',
      name: 'workspace4',
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

    cy.contains('Edit').click();
    cy.wait(1000);

    const newTitle = 'Edited Bounty Title';
    const newDescription = 'This bounty has been edited';

    cy.get('.inputText').eq(0).clear({ force: true }).type(newTitle);
    cy.wait(1000);
    cy.get('[data-testid="checktextarea"]').clear().type(newDescription);
    cy.wait(1000);

    cy.contains('Save').click();
    cy.wait(1000);
    cy.contains(newTitle).should('exist');
    cy.contains(newDescription).should('exist');
    cy.get('body').click(0, 0);
    cy.logout(activeUser);
  });
});
