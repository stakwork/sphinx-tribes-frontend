describe('Super Admin Bounty Filter Status Dropdown ', () => {
  let activeUser = 'alice';

  const bounty: Cypress.Bounty = {
    title: 'Syed',
    category: 'Web development',
    description: 'This is available',
    amount: '123',
    assign: 'carol',
    deliverables: 'We are good to go man'
  };

  beforeEach(() => {
    cy.login(activeUser);
    cy.wait(1000);
  });

  it('Should create six bounties with different status and verify that changing the bounties filter status displays only bounties with that specific status', () => {
    for (let i = 1; i <= 4; i++) {
      const updatedBounty = { ...bounty, title: `Syed${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    for (let i = 5; i <= 6; i++) {
      const updatedBounty = { ...bounty, title: `Syed${i}`, assign: '' };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.contains('Filter').click();
    cy.contains('Open').click();
    cy.contains('Assigned').click();
    cy.wait(1000);

    for (let i = 1; i <= 2; i++) {
      cy.contains(`Syed${i}`).click();
      cy.wait(1000);

      cy.contains('Mark as Paid').click();
      cy.wait(1000);

      cy.contains('Next').click();
      cy.wait(1000);

      cy.contains('Skip and Mark Paid').click();
      cy.wait(1000);

      cy.get('body').click(0, 0);

      cy.wait(1000);
    }

    cy.visit('http://localhost:3007/admin');
    cy.wait(3000);

    for (let i = 1; i <= 6; i++) {
      cy.contains(`Syed${i}`, { timeout: 10000 }).should('exist');
    }

    cy.contains('Status').click();
    cy.get('label[for="Open"]').click();
    cy.contains('Apply').click();
    cy.wait(1000);

    for (let i = 5; i <= 6; i++) {
      cy.contains(`Syed${i}`, { timeout: 10000 }).should('exist');
    }

    for (let i = 1; i <= 4; i++) {
      cy.contains(`Syed${i}`, { timeout: 10000 }).should('not.exist');
    }

    cy.contains('Status').click();
    cy.get('label[for="Open"]').click();
    cy.get('label[for="Assigned"]').click();
    cy.contains('Apply').click();
    cy.wait(1000);

    for (let i = 3; i <= 4; i++) {
      cy.contains(`Syed${i}`, { timeout: 10000 }).should('exist');
    }

    for (let i = 1; i <= 2; i++) {
      cy.contains(`Syed${i}`, { timeout: 10000 }).should('not.exist');
    }

    for (let i = 5; i <= 6; i++) {
      cy.contains(`Syed${i}`, { timeout: 10000 }).should('not.exist');
    }

    cy.contains('Status').click();
    cy.get('label[for="Assigned"]').click();
    cy.get('label[for="Paid"]').click();
    cy.contains('Apply').click();
    cy.wait(1000);

    for (let i = 1; i <= 2; i++) {
      cy.contains(`Syed${i}`, { timeout: 10000 }).should('exist');
    }

    for (let i = 3; i <= 6; i++) {
      cy.contains(`Syed${i}`, { timeout: 10000 }).should('not.exist');
    }

    cy.wait(1000);

    cy.logout(activeUser);
  });
});
