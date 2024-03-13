describe('View Organization Bounties', () => {
    it('Should view bounties created by an organization', () => {
    let activeUser = 'alice';
    cy.login(activeUser);
    cy.wait(1000);

      const organization = 'New Organization test 12th march'; // Adjust organization name as per your test

      cy.create_bounty({
        organization : organization,
        title: 'Bounty Title',
        category: 'Web development',
        coding_language: ['Typescript', 'Javascript', 'Lightning'],
        description: 'This is available',
        amount: '123',
        assign: 'John Doe',
        deliverables: 'We are good to go',
        tribe: '',
        estimate_session_length: 'Less than 3 hour',
        estimate_completion_date: '09/09/2024'
      });

      cy.wait(1000);
  
      cy.assert_org_bounty({
        title: 'Bounty Title',
        category: 'Web development',
        description: 'This is available',
        amount: '123',
      }, organization);

      cy.wait(1000);

      cy.logout(activeUser);
    });
  });
  