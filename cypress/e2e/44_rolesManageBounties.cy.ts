describe('carol manage organization bounties', () => {
  it('should carol manage organization bounties', () => {
    const OrgName = 'Org_Name';

    const org: Cypress.Organization = {
      loggedInAs: 'alice',
      name: OrgName,
      description: 'An organization focused on amazing projects.',
      website: 'https://amazing.org',
      github: 'https://github.com/amazing'
    };

    const bounty: Cypress.Bounty = {
      organization: OrgName,
      title: 'Role Manage Bounty',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Org Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'bob'
    };

    cy.login(org.loggedInAs);
    cy.wait(1000);

    cy.create_org(org);
    cy.wait(1000);

    cy.contains(org.name).contains('Manage').click();
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

    cy.logout(org.loggedInAs);
    cy.wait(1000);

    cy.login('carol');
    cy.wait(1000);

    cy.contains('carol').click({ force: true });
    cy.wait(1000);

    cy.contains(OrgName).contains('Manage').should('exist');
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
