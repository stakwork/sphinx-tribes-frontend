describe('matches organization description with Carol updated description', () => {
  it('should matches organization description with Carol updated description', () => {
    const OrgName = 'Update Description';

    const org: Cypress.Organization = {
      loggedInAs: 'alice',
      name: OrgName,
      description: 'An organization focused on amazing projects.',
      website: 'https://amazing.org',
      github: 'https://github.com/amazing'
    };

    const updatedOrgDescription = 'Updated organization Description.';

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
    cy.wait(1000);

    cy.contains('carol').click({ force: true });
    cy.wait(1000);

    cy.contains(OrgName).contains('Manage').click({ force: true });
    cy.wait(1000);

    cy.contains(/^Edit$/).click();
    cy.wait(1000);

    cy.get('[data-testid="description"]').clear().type(updatedOrgDescription);
    cy.wait(1000);

    cy.contains('Save changes').click();
    cy.wait(600);

    cy.contains('Sucessfully updated organization');
    cy.wait(1000);

    cy.contains(/^Edit$/).click();
    cy.wait(1000);

    cy.contains(updatedOrgDescription).should('exist');
    cy.wait(600);

    // Deleting the current organization after a successful assertion.
    cy.get('body').click(0, 0);
    cy.logout('carol');
    cy.wait(1000);

    cy.login(org.loggedInAs);
    cy.wait(1000);

    cy.contains(org.loggedInAs).click({ force: true });
    cy.wait(1000);

    cy.contains(OrgName).contains('Manage').click({ force: true });
    cy.wait(1000);

    cy.contains(/^Edit$/).click();
    cy.wait(1000);

    cy.contains('Delete Organization').click({ force: true });
    cy.wait(1000);

    cy.contains(/^Delete$/).click();
    cy.wait(1000);
  });
});
