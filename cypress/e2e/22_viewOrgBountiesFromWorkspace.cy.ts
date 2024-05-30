describe('User creates a bounties attached to an workspace', () => {
  const workspace: Cypress.Workspace = {
    loggedInAs: 'alice',
    name: 'Umer Workspace-34',
    description: 'An workspace focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    workspace: 'Umer Workspace-34',
    title: 'Bounty',
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

  beforeEach(() => {
    cy.login(workspace.loggedInAs);
    cy.wait(1000);
    cy.contains(workspace.loggedInAs).click();
    cy.wait(1000);
    cy.create_workspace(workspace);
    cy.wait(1000);
  });

  it('should display bounties in the workspace list with workspace label', () => {
    for (let i = 1; i <= 4; i++) {
      const updatedBounty = { ...bounty, title: `Bounty ${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.contains(workspace.loggedInAs).click();
    cy.wait(1000);

    cy.contains(workspace.name).get(`[data-work-name="${workspace.name}"]`).click();
    cy.wait(1000);

    cy.get('a[href*="/workspace/bounties"]').then(($link: JQuery<HTMLElement>) => {
      const modifiedHref = $link.attr('href');
      cy.wrap($link).invoke('removeAttr', 'target');
      cy.wrap($link).click();
      cy.url().should('include', modifiedHref);
    });
    cy.wait(1000);

    for (let i = 1; i <= 4; i++) {
      cy.contains(`Bounty ${i}`, { timeout: 10000 }).should('exist');
    }

    cy.contains(workspace.name).should('exist');
    cy.wait(600);

    cy.contains(workspace.description).should('exist');
    cy.wait(600);

    cy.contains('Website').should('exist');
    cy.wait(600);

    // click outside the modal
    cy.get('body').click(0, 0);
    cy.logout(workspace.loggedInAs);
  });
});
