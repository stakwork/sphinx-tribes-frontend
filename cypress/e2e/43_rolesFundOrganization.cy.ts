describe('Fund Organization Role Test', () => {
  let activeUser = 'carol';

  const org: Cypress.Organization = {
    loggedInAs: 'alice',
    name: 'mi44att',
    description: 'An organization focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  beforeEach(() => {
    cy.clearCookies();
  });

  it('Should allow a user with a Fund Organization role to deposit into the organization', () => {
    cy.login(org.loggedInAs);
    cy.wait(1000);

    cy.contains(org.loggedInAs).click();
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

    cy.contains('label', 'Manage bounties').prev('input[type="checkbox"]').click();
    cy.wait(1000);

    cy.contains('label', 'Withdraw from organization').prev('input[type="checkbox"]').click();
    cy.wait(1000);

    cy.contains('label', 'View transaction history').prev('input[type="checkbox"]').click();
    cy.wait(1000);

    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Assign').click();
      cy.wait(1000);
    });

    cy.logout(org.loggedInAs);
    cy.wait(1000);

    cy.login(activeUser);
    cy.wait(1000);

    cy.contains(activeUser).click();
    cy.wait(1000);

    //Assert that the new organization is on Carol's list
    cy.contains(org.name).should('exist').and('be.visible');
    cy.wait(1000);

    cy.contains(org.name).contains('Manage').click();
    cy.wait(1000);

    //Assert that the Deposit button is not disabled
    cy.get('[data-testid="organization-deposit-budget-button"]')
      .contains('Deposit')
      .should('not.be.disabled');
    cy.wait(1000);

    cy.get('[data-testid="organization-deposit-budget-button"]').contains('Deposit').click();
    cy.wait(1000);

    //Assert that 'Deposit' is visible
    cy.get('h2.sc-prpXb.iqZzaC').contains('Deposit').should('be.visible');
    cy.wait(1000);

    //Assert that 'Amount (in sats)' is visible
    cy.contains('Amount (in sats)').should('be.visible');
    cy.wait(1000);

    cy.get('body').click(0, 0);
    cy.wait(1000);

    cy.logout(activeUser);
    cy.wait(1000);
  });
});
