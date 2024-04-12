describe('View Transaction History', () => {
  const workSpace = {
    loggedInAs: 'alice',
    name: 'SyedWorkspaceZ',
    description: 'We are testing out our workspace',
    website: '',
    github: ''
  };

  it('Create a workspace and assign a View History role to a user and user would be able to view the workspace transaction history', () => {
    cy.login(workSpace.loggedInAs);
    cy.wait(1000);

    cy.create_workspace(workSpace);
    cy.wait(1000);

    cy.contains(workSpace.name).contains('Manage').click();
    cy.wait(1000);

    cy.contains('Add User').click();
    cy.wait(1000);

    cy.get('input').type('Carol');
    cy.wait(1000);

    cy.contains('Select').click();
    cy.wait(1000);

    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Add User').click();
      cy.wait(1000);
    });
    cy.wait(1000);

    cy.contains('label', 'Fund workspace').prev('input[type="checkbox"]').uncheck();
    cy.wait(1000);
    cy.contains('label', 'Manage bounties').prev('input[type="checkbox"]').uncheck();
    cy.wait(1000);
    cy.contains('label', 'Withdraw from workspace').prev('input[type="checkbox"]').uncheck();
    cy.wait(1000);
    cy.get('#sphinx-top-level-overlay').within(() => {
      cy.contains('Assign').click();
      cy.wait(1000);
    });

    cy.logout(workSpace.loggedInAs);
    cy.wait(1000);

    cy.login('carol');
    cy.wait(1000);

    cy.contains('carol').click();
    cy.wait(1000);

    cy.contains(workSpace.name).should('exist');
    cy.wait(1000);

    cy.contains(workSpace.name).contains('Manage').click();
    cy.wait(1000);

    cy.contains('History').should('not.be.disabled');
    cy.wait(1000);

    cy.contains('History').click();
    cy.wait(1000);

    cy.contains('label', 'Payments').should('exist');
    cy.wait(1000);
    cy.contains('label', 'Deposit').should('exist');
    cy.wait(1000);
    cy.contains('label', 'Withdrawals').should('exist');
    cy.wait(1000);

    cy.get('body').click(0, 0);
    cy.logout('carol');
  });
});
