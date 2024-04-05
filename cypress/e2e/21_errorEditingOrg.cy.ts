describe('Alice Create an Organization and then Edit to validate characters the limit', () => {
  const org = {
    loggedInAs: 'alice',
    name: 'Cypress Org Edit',
    description: 'Cypress Org description'
  };

  const orgExceedingLimits = {
    name: 'ThisNameIsWayTooLongForAnOrganization',
    description:
      'This description is intentionally made longer than one hundred and twenty characters to test the validation functionality of the organization creation form.'
  };

  before(() => {
    cy.login(org.loggedInAs);
    cy.wait(1000);
  });

  it('should not allow editing an organization with excessive character limits', () => {
    cy.contains(org.loggedInAs).click({ force: true });
    cy.wait(1000);

    cy.contains('Organizations').click();
    cy.wait(1000);

    cy.contains('Add Organization').click();
    cy.wait(1000);

    cy.get('[placeholder="My Organization..."]').type(org.name);
    cy.get('[placeholder="Description Text..."]').type(org.description);

    cy.wait(600);

    cy.get('[data-testid="add-organization"]').contains('Add Organization').click();
    cy.wait(1000);

    cy.contains('.org-text-wrap', org.name)
      .parents('.org-data')
      .within(() => {
        cy.get('button').contains('Manage').click();
      });
    cy.wait(1000);

    cy.contains(/^Edit$/).click();
    cy.wait(1000);

    cy.get('#name').type(orgExceedingLimits.name);
    cy.get('#description').type(orgExceedingLimits.description);
    cy.wait(1000);

    cy.get('input#name').then(($input) => {
      cy.wrap($input.closest('div')).find('p').should('contain.text', 'name is too long');
    });

    cy.get('textarea#description').then(($textarea) => {
      cy.wrap($textarea.closest('div')).find('p').should('contain.text', 'Description is too long');
    });

    cy.get('body').click(0, 0);
    cy.logout(org.loggedInAs);
  });
});
