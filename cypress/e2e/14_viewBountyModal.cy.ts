describe('View Organization Bounties', () => {
  const OrgName = 'OrganizationView';

  const org: Cypress.Organization = {
    loggedInAs: 'alice',
    name: OrgName,
    description: 'An organization focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    organization: OrgName,
    title: 'Bounty',
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

  beforeEach(() => {
    cy.login(org.loggedInAs);
    cy.wait(1000);
    cy.create_org(org);
    cy.wait(1000);
  });

  it('should verify  bounty tile displays the organization label is clickable and redirects the user to the organizations bounty page.', () => {
    cy.create_bounty(bounty);
    cy.wait(5000);

    cy.contains(bounty.title);
    cy.wait(5000);

    cy.contains(org.name);
    cy.wait(1000);

    cy.contains(org.name).invoke('removeAttr', 'target').click({ force: true });
    cy.wait(5000);

    cy.url().should('include', '/org/bounties');
    cy.wait(5000);

    cy.contains(bounty.title).should('exist');
    cy.wait(1000);

    cy.logout(org.loggedInAs);
  });
});