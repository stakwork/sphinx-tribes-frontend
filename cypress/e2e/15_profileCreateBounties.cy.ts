describe('Alice tries to create a bounty on the user profile page and view them', () => {
    const workspace: Cypress.Workspace = {
        loggedInAs: 'alice',
        name: 'Workspace10',
        description: 'A workspace focused on amazing projects.',
        website: 'https://amazing.org',
        github: 'https://github.com/amazing'
    };

    beforeEach(() => {
        cy.login(workspace.loggedInAs);
        cy.wait(1000);
        cy.create_workspace(workspace);
        cy.wait(1000);
    });


    it('Create view bounties user profile page', () => {

    cy.contains(workspace.loggedInAs).click();
    cy.wait(1000);

    for (let i = 1; i <= 2; i++) {
      cy.create_bounty(
        {
            workspace:'Workspace10',
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
      cy.contains(`Bounty Title ${i}`);
    }
    cy.wait(1000);

    // click outside the modal
    cy.get('body').click(0, 0);

    cy.logout(workspace.loggedInAs);
  });
});
