describe('Alice tries to create 8 bounties and then assert that he can go to the next and previous bounties', () => {
  it('Create 8 bounties and assert next and previous bounties', () => {
    let activeUser = 'bob';
    cy.login(activeUser);
    cy.wait(2000);

    const assignees = ['', '', '', 'carol', 'carol', 'carol', 'carol', 'carol'];

    for (let i = 0; i < 8; i++) {
      cy.create_bounty({
        title: `Navigation Bounty Title ${i}`,
        category: 'Web development',
        coding_language: ['Typescript'],
        description: 'Lorem Ipsum Dolor',
        amount: '20000',
        assign: assignees[i],
        deliverables: 'We are good to go man',
        tribe: '',
        estimate_session_length: '3 hours',
        estimate_completion_date: '09/09/2024'
      });
      cy.wait(2000);

      if (i > 5) {
        if (i === 6) {
          cy.contains('Filter').click();
          cy.contains('Assigned').click();
          cy.wait(2000);
        }

        cy.contains(`Navigation Bounty Title ${i}`).click();
        cy.wait(2000);

        cy.contains('Mark as Paid').click();
        cy.wait(2000);

        cy.contains('Next').click();
        cy.wait(2000);

        cy.contains('Skip and Mark Paid').click();
        cy.wait(2000);

        cy.get('body').click(0, 0);
        cy.wait(2000);
      }
    }

    cy.contains('Filter').click();
    cy.contains('Assigned').click();
    cy.wait(2000);

    for (let i = 0; i < 3; i++) {
      cy.contains(`Navigation Bounty Title ${i}`);
    }

    cy.contains('Navigation Bounty Title 0').click();
    cy.wait(2000);

    cy.contains('chevron_left').click();
    cy.wait(2000);

    cy.contains('chevron_right').click();
    cy.wait(2000);

    cy.get('[data-testid="close-btn"]').click({ force: true });
    cy.wait(3000);

    cy.contains('Filter').click();
    cy.contains('Paid').click();
    cy.wait(2000);

    cy.contains('Navigation Bounty Title 6');
    cy.contains('Navigation Bounty Title 7');

    cy.contains('Navigation Bounty Title 6').click();
    cy.wait(2000);

    cy.contains('chevron_right').click();
    cy.wait(2000);

    cy.get('[data-testid="close-btn"]').click({ force: true });
    cy.wait(2000);

    cy.contains('Filter').click();
    cy.contains('Assigned').click();
    cy.wait(2000);

    for (let i = 0; i < 8; i++) {
      cy.contains(`Navigation Bounty Title ${i}`);
    }

    cy.contains('Navigation Bounty Title 1').click();
    cy.wait(2000);

    cy.contains('chevron_left').click();
    cy.wait(2000);

    cy.contains('Navigation Bounty Title 0');
    cy.wait(2000);

    cy.contains('chevron_right').click();
    cy.wait(2000);

    cy.contains('Navigation Bounty Title 1');
    cy.wait(2000);

    cy.contains('chevron_right').click();
    cy.wait(2000);

    cy.contains('Navigation Bounty Title 2');
    cy.wait(2000);

    cy.get('[data-testid="close-btn"]').click({ force: true });
    cy.logout(activeUser);
  });
});
