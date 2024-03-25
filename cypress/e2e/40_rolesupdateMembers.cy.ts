describe('filter by status for org bounty', () => {
  it('should filter bounties according to the status selected', () => {
    const OrgName = 'UpdateRolesE2E';

    const org: Cypress.Organization = {
      loggedInAs: 'alice',
      name: OrgName,
      description: 'An organization focused on amazing projects.',
      website: 'https://amazing.org',
      github: 'https://github.com/amazing'
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

    cy.contains('Manage organization').click();
    cy.wait(1000);

    cy.contains('Update members').click();
    cy.wait(1000);

    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Assign').click();
      cy.wait(1000);
    });
    cy.wait(1000);

    cy.logout(org.loggedInAs);
    cy.wait(1000);

    cy.login('carol');

    cy.contains('carol').click({ force: true });
    cy.wait(1000);

    cy.contains(OrgName).contains('Manage').click({ force: true });
    cy.wait(1000);

    cy.contains('Add User').click();
    cy.wait(1000);

    cy.get('input[placeholder="Type to search ..."]').type('bob');
    cy.wait(1000);

    cy.contains('Select').click();
    cy.wait(1000);

    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Add User').click();
      cy.wait(1000);

      cy.contains('Assign').click();
      cy.wait(1000);
    });
    cy.wait(1000);

    cy.get('[data-testid="user_alias"]').should('contain', 'bob').should('exist');
    cy.wait(1000);
  });
});
