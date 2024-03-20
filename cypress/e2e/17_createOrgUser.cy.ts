describe('Add User to Organization', () => {
  it('should add a user to an organization', () => {
    const org = {
      loggedInAs: 'carol',
      name: 'TEST E2E',
      description: 'We are testing out our organization',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.login(org.loggedInAs);
    cy.wait(1000);

    cy.create_org(org);
    cy.wait(1000);

    cy.contains(org.name).contains('Manage').click();
    cy.wait(1000);

    cy.contains('Add User').click();
    cy.wait(1000);

    cy.get('input').type('alice');
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

    cy.contains('alice').get('[data-testid="settings-icon"]').click();
    cy.wait(1000);

    cy.contains('label', 'Manage bounties').prev('input[type="checkbox"]').should('be.checked');
    cy.wait(1000);

    cy.contains('label', 'Fund organization').prev('input[type="checkbox"]').should('be.checked');
    cy.wait(1000);

    cy.contains('label', 'Withdraw from organization')
      .prev('input[type="checkbox"]')
      .should('be.checked');
    cy.wait(1000);

    cy.contains('label', 'View transaction history')
      .prev('input[type="checkbox"]')
      .should('be.checked');
    cy.wait(1000);

    cy.contains('Update roles').click();
    cy.wait(1000);

    cy.wait(1000);
    cy.logout(org.loggedInAs);
  });
});
