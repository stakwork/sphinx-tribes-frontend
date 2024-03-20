describe('It Pays a bounty ', () => {
  it('It makes a Keysend payment to bounty assignee', async () => {
    cy.login('carol');

    // create org
    const org = {
      loggedInAs: 'carol',
      name: 'Payment Organization 1',
      description: 'We are testing out our oeganization',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    };

    cy.create_org(org);
    cy.wait(1000);

    cy.contains('Manage').click();

    // add organization budget
    cy.contains('Deposit').click();
    cy.get('[data-testid="input-amount"]').type('5000');
    cy.get('[data-testid="generate-button"]').click();
    cy.contains('Invoice Created Successfully');
    cy.wait(4000);

    // get invoice from clipboard anf pay bounty
    cy.get('[data-challenge]')
      .invoke('attr', 'data-challenge')
      .then((value) => {
        cy.pay_invoice({ payersName: 'carol', invoice: value });
        cy.wait(4000);
        cy.contains('Successfully Deposited');
        cy.get('body').click(0, 0);
      });

    // creates bounty
    const bounty: Cypress.Bounty = {
      title: 'My new Bounty',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '500',
      assign: 'carol',
      deliverables: 'We are good to go man',
      organization: org.name,
      tribe: '',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024'
    };

    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains('Filter').click();
    cy.contains('Assigned').click();
    cy.wait(1000);

    // clicks on bounty
    cy.contains(bounty.title).click();
    cy.wait(1000);

    // paybounty
    cy.contains('Pay Bounty').click();
    cy.wait(1000);

    cy.contains('Confirm').click({ force: true });
    cy.wait(1000);
    cy.contains('Paid successfully');

    // close the bounty
    cy.get('body').click(0, 0);
    cy.wait(1000);

    // logout
    cy.logout('carol');
  });
});
