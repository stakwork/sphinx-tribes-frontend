describe('Edit Organization Details', () => {
  const org: Cypress.Organization = {
    loggedInAs: 'alice',
    name: 'Mirza Org_test_34',
    description: 'An organization focused on amazing projects.',
    website: 'https://amazing.org'
  };

  const updatedOrg = {
    name: 'OrgBounties',
    description: 'Updated description for our organization.',
    website: 'https://updated.org'
  };

  before(() => {
    cy.login(org.loggedInAs);
    cy.wait(1000);
    cy.contains(org.loggedInAs).click();
    cy.wait(1000);
    cy.create_org(org);
    cy.wait(1000);
  });

  it('should edit organization details successfully', () => {
    cy.contains(org.name).contains('Manage').click();
    cy.wait(1000);

    cy.contains(/^Edit$/).click();
    cy.wait(1000);

    cy.get('[data-testid="name"]').clear().type(updatedOrg.name);
    cy.wait(1000);

    cy.get('[data-testid="website"]').clear().type(updatedOrg.website);
    cy.wait(1000);

    cy.get('[data-testid="description"]').clear().type(updatedOrg.description);
    cy.wait(1000);

    cy.contains('Save changes').click();
    cy.wait(600);

    cy.contains('Sucessfully updated organization');
    cy.wait(1000);

    cy.contains(updatedOrg.name).should('exist');
    cy.wait(600);

    // click outside the modal
    cy.get('body').click(0, 0);
    cy.logout(org.loggedInAs);
  });
});
