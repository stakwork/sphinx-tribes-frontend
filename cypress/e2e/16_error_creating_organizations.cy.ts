describe('Organization creation error handling', () => {
  const orgExceedingLimits = {
    loggedInAs: 'alice',
    name: 'ThisNameIsWayTooLongForAnOrganization', // More than 20 characters
    description:
      'This description is intentionally made longer than one hundred and twenty characters to test the validation functionality of the organization creation form.' // More than 120 characters
  };

  before(() => {
    cy.login(orgExceedingLimits.loggedInAs);
    cy.wait(1000);
  });

  it('should not allow adding an organization with excessive character limits', () => {
    cy.contains(orgExceedingLimits.loggedInAs).click({ force: true });
    cy.wait(1000);

    cy.contains('Organizations').click();
    cy.wait(1000);

    cy.contains('Add Organization').click();
    cy.wait(1000);

    cy.get('[placeholder="My Organization..."]').type(orgExceedingLimits.name);
    cy.get('[placeholder="Description Text..."]').type(orgExceedingLimits.description);

    cy.wait(600);

    cy.get('button.sc-pQtXH.fOUUSv').contains('Add Organization').should('be.disabled');

    cy.get('[placeholder="My Organization..."]').parent().contains('Name is too long.');
    cy.get('[placeholder="Description Text..."]').parent().contains('Description is too long.');

    // click outside the modal
    cy.get('body').click(0, 0);
    cy.logout(orgExceedingLimits.loggedInAs);
  });
});
