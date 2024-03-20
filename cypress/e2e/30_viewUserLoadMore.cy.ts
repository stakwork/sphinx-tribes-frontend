describe('Load More For Created And Assigned Bounties', () => {
  let activeUser = 'carol';

  const bounty: Cypress.Bounty = {
    title: 'Syed Bounty',
    category: 'Web development',
    description: 'This is available',
    amount: '12',
    tribe: 'Amazing Org Tribe',
    deliverables: 'We are good to go man',
    assign: 'alice'
  };

  beforeEach(() => {
    cy.login(activeUser);
    cy.wait(1000);
  });

  it('Thirty bounties should be created and assigned to a user, and they should be visible on both sides', () => {
    for (let i = 1; i <= 30; i++) {
      const updatedBounty = { ...bounty, title: `Syed Bounty${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/p');
    cy.wait(1000);

    cy.get('input').type('alice');
    cy.wait(1000);

    cy.contains('alice').click();
    cy.wait(1000);

    cy.contains('Assigned Bounties').click();
    cy.wait(1000);

    for (let i = 30; i >= 1; i--) {
      cy.contains(`Syed Bounty${i}`, { timeout: 10000 }).should('exist');
      if (i === 11) {
        cy.contains('Load More').scrollIntoView().click();
        cy.wait(1000);
      }
    }

    cy.contains(activeUser).click();
    cy.wait(1000);

    cy.get('[data-testid="Bounties-tab"]').click();
    cy.wait(1000);

    for (let i = 30; i >= 1; i--) {
      cy.contains(`Syed Bounty${i}`, { timeout: 10000 }).should('exist');
      if (i === 11) {
        cy.contains('Load More').scrollIntoView().click();
        cy.wait(1000);
      }
    }

    cy.get('body').click(0, 0);
    cy.logout(activeUser);
  });
});
