describe('Add User to Organization', () => {
  it('should add a user to an organization', () => {
    const org = {
      loggedInAs: 'carol',
      name: 'Org1A',
      description: 'We are testing out our organization',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.login(org.loggedInAs);
    cy.wait(1000);

    cy.create_org(org);
    cy.wait(1000);

    cy.contains('Manage').click();
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
    });

    cy.get('#Manage bounties').should('be.checked');
    cy.get('#Fund organization').should('be.checked');
    cy.get('#Withdraw from organization').should('be.checked');
    cy.get('#View transaction history').should('be.checked');

    cy.contains('Assign').click();
    cy.wait(1000);

    cy.wait(1000);

    cy.logout(org.loggedInAs);
  });
});
