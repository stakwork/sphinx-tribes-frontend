describe('carol manage workspace bounties', () => {
  it('should carol manage workspace bounties', () => {
    const WorkSpaceName = 'Work_Name';

    const workSpace: Cypress.Workspace = {
      loggedInAs: 'alice',
      name: WorkSpaceName,
      description: 'A workspace focused on amazing projects.',
      website: 'https://amazing.org',
      github: 'https://github.com/amazing'
    };

    const bounty: Cypress.Bounty = {
      workspace: WorkSpaceName,
      title: 'Role Manage Bounty',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Workspace Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'bob'
    };

    cy.login(workSpace.loggedInAs);
    cy.wait(1000);

    cy.create_workspace(workSpace);
    cy.wait(1000);

    cy.contains(workSpace.name).get(`[data-work-name="${workSpace.name}"]`).click();
    cy.wait(1000);

    cy.contains('Add User').click();
    cy.wait(1000);

    cy.get('input').type('carol');
    cy.wait(1000);

    cy.contains('Select').click();
    cy.wait(1000);

    cy.get('#sphinx-top-level-overlay').should('be.visible');

    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Add User').click();
      cy.wait(1000);
    });
    cy.wait(1000);

    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Assign').click();
      cy.wait(1000);
    });
    cy.wait(1000);

    cy.logout(workSpace.loggedInAs);
    cy.wait(1000);

    cy.login('carol');
    cy.wait(1000);

    cy.clickAlias('carol');
    cy.wait(1000);

    cy.contains(WorkSpaceName)
      .get(`[data-work-name="${workSpace.name}"]`)
      .contains('Manage')
      .should('exist');
    cy.wait(1000);

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.contains('Assigned').click();
    cy.wait(1000);

    cy.contains(bounty.title).click();
    cy.wait(1000);

    cy.contains('Pay Bounty').should('exist');
    cy.wait(600);

    cy.get('body').click(0, 0);
    cy.logout('carol');
  });
});
