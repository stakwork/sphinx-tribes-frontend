describe('Alice tries to create a bounty', () => {
  it('Create a bonty', () => {
    let activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    cy.contains('Bounties').click();
    cy.wait(1000);
    cy.contains('Post a Bounty').click();
    cy.contains('Start').click();
    cy.contains('label', 'Bounty Title').type('Tobi is testing');
    cy.get('[data-testid="Category *"]').click();
    cy.contains('Web development').click();
    cy.contains('Coding Language').click();
    cy.contains('Lightning').click();
    cy.contains('Typescript').click();
    cy.contains('Coding Language').click();
    cy.contains('Next').click();
    cy.get('.euiTextArea').type(
      'We are trying to describe what type of bounty we are using currently and hope this works out well for us'
    );
    cy.contains('Next').click();
    cy.contains('label', 'Price (Sats)').type('1234');
    cy.contains('Next').click();
    cy.get('.SearchInput').type('bob');
    cy.contains('Assign').click();
    cy.get('.People').contains('Assign').click();
    cy.contains('Finish').click();

    cy.wait(1000);
    cy.logout(activeUser);
  });
});
