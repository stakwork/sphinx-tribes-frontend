describe('Alice tries to create 8 bounties and then assert filtered bounties', () => {
  it('Create 8 bounties and assert filtered bounties', () => {
    let activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

    const assignees = ['carol', 'carol', 'carol', '', '', '', 'carol', 'carol'];
    const languages = [
      'Typescript',
      'Lightning',
      'PHP',
      'Typescript',
      'PHP',
      'Typescript',
      'Lightning',
      'Typescript'
    ];

    for (let i = 0; i < 8; i++) {
      cy.create_bounty({
        title: `Filter Bounty Title ${i}`,
        category: 'Web development',
        coding_language: [languages[i]],
        description: 'Lorem Ipsum Dolor',
        amount: '10000',
        assign: assignees[i],
        deliverables: 'We are good to go man',
        tribe: '',
        estimate_session_length: 'Less than 3 hour',
        estimate_completion_date: '09/09/2024'
      });
      cy.wait(1000);

      if (i > 5) {
        if (i === 6) {
          // Unchecked the Open Filter and Checked the Assigned Filter
          cy.contains('Filter').click();
          cy.contains('Open').click();
          cy.contains('Assigned').click();
          cy.wait(1000);
        }

        cy.contains(`Filter Bounty Title ${i}`).click();
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
    }

    cy.logout(activeUser);
    cy.wait(1000);

    // Unchecked the Open Filter and Checked the Assigned Filter
    cy.contains('Filter').click();
    cy.contains('Open').click();
    cy.contains('Assigned').click();
    cy.contains('Filter').click();
    cy.wait(1000);

    for (let i = 0; i < 8; i++) {
      if (i < 3) {
        cy.contains(`Filter Bounty Title ${i}`).should('exist');
      } else {
        cy.contains(`Filter Bounty Title ${i}`).should('not.exist');
      }
    }
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.contains('label', 'Typescript').click();
    cy.contains('Filter').click();
    cy.wait(1000);

    for (let i = 0; i < 8; i++) {
      if (i == 0) {
        cy.contains(`Filter Bounty Title ${i}`).should('exist');
      } else {
        cy.contains(`Filter Bounty Title ${i}`).should('not.exist');
      }
    }
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.contains('label', 'Lightning').click();
    cy.contains('Filter').click();
    cy.wait(1000);

    for (let i = 0; i < 8; i++) {
      if (i < 2) {
        cy.contains(`Filter Bounty Title ${i}`).should('exist');
      } else {
        cy.contains(`Filter Bounty Title ${i}`).should('not.exist');
      }
    }
  });
});
