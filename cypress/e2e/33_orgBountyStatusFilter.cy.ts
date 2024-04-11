describe('filter by status for org bounty', () => {
  it('should filter bounties according to the status selected', () => {
    const OrgName = 'E2EOrg3';

    const org: Cypress.Organization = {
      loggedInAs: 'bob',
      name: OrgName,
      description: 'An organization focused on amazing projects.',
      website: 'https://amazing.org',
      github: 'https://github.com/amazing'
    };

    cy.login(org.loggedInAs);
    cy.wait(1000);

    cy.create_org(org);
    cy.wait(1000);

    const bounty1: Cypress.Bounty = {
      organization: OrgName,
      title: 'Bounty1(open)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Org Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: ''
    };

    const bounty2: Cypress.Bounty = {
      organization: OrgName,
      title: 'Bounty2(open)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Org Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: ''
    };

    const bounty3: Cypress.Bounty = {
      organization: OrgName,
      title: 'Bounty3(open)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Org Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: ''
    };

    const bounty4: Cypress.Bounty = {
      organization: OrgName,
      title: 'Bounty4(Assigned)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Org Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'carol'
    };

    const bounty5: Cypress.Bounty = {
      organization: OrgName,
      title: 'Bounty5(Assigned)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Org Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'alice'
    };

    const bounty6: Cypress.Bounty = {
      organization: OrgName,
      title: 'Bounty6(Assigned)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Org Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'carol'
    };

    const bounty7: Cypress.Bounty = {
      organization: OrgName,
      title: 'Bounty7(paid)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Org Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'carol'
    };

    const bounty8: Cypress.Bounty = {
      organization: OrgName,
      title: 'Bounty8(paid)',
      category: 'Web development',
      coding_language: ['Typescript', 'Javascript', 'Lightning'],
      description: 'This is available',
      amount: '123',
      tribe: 'Amazing Org Tribe',
      estimate_session_length: 'Less than 3 hour',
      estimate_completion_date: '09/09/2024',
      deliverables: 'We are good to go man',
      assign: 'alice'
    };

    cy.create_bounty(bounty1);
    cy.wait(1000);

    cy.contains(bounty1.title);
    cy.wait(5000);

    cy.contains(org.name);
    cy.wait(1000);

    cy.contains(org.name).invoke('removeAttr', 'target').click({ force: true });
    cy.wait(5000);

    cy.url().should('include', '/org/bounties');
    cy.wait(5000);

    cy.create_orgBounty(bounty2);
    cy.wait(1000);

    cy.create_orgBounty(bounty3);
    cy.wait(1000);

    cy.contains('Status').first().click();
    cy.wait(1000);

    cy.contains('label', 'Open').click();
    cy.wait(1000);

    cy.contains(bounty1.title);
    cy.wait(1000);

    cy.contains(bounty2.title);
    cy.wait(1000);

    cy.contains(bounty3.title);
    cy.wait(1000);

    cy.contains('label', 'Open').click();
    cy.wait(1000);

    cy.create_orgBounty(bounty4);
    cy.wait(1000);

    cy.create_orgBounty(bounty5);
    cy.wait(1000);

    cy.create_orgBounty(bounty6);
    cy.wait(1000);

    cy.contains('Status').first().click();
    cy.wait(1000);

    cy.contains('label', 'Assigned').click();
    cy.wait(1000);

    cy.contains(bounty4.title);
    cy.wait(1000);

    cy.contains(bounty5.title);
    cy.wait(1000);

    cy.contains(bounty6.title);
    cy.wait(1000);

    cy.contains('label', 'Assigned').click();
    cy.wait(1000);

    cy.create_orgBounty(bounty7);
    cy.wait(1000);

    cy.create_orgBounty(bounty8);
    cy.wait(1000);

    cy.contains(bounty7.title).click();
    cy.wait(1000);

    cy.contains('Mark as Paid').click();
    cy.wait(1000);

    cy.contains('Next').click();
    cy.wait(1000);

    cy.contains('Skip and Mark Paid').click();
    cy.wait(1000);

    cy.contains('paid');

    cy.get('body').click(0, 0);
    cy.wait(1000);

    cy.contains(bounty8.title).click();
    cy.wait(1000);

    cy.contains('Mark as Paid').click();
    cy.wait(1000);

    cy.contains('Next').click();
    cy.wait(1000);

    cy.contains('Skip and Mark Paid').click();
    cy.wait(1000);

    cy.contains('paid');

    cy.get('body').click(0, 0);
    cy.wait(1000);

    cy.contains('Status').first().click();
    cy.wait(1000);

    cy.contains('label', 'Paid').click();
    cy.wait(1000);

    cy.contains(bounty7.title);
    cy.wait(1000);

    cy.contains(bounty8.title);
    cy.wait(1000);

    cy.contains('label', 'Paid').click();
    cy.wait(1000);

    cy.contains('Status').first().click();
    cy.wait(1000);

    cy.logout(org.loggedInAs);
  });
});
