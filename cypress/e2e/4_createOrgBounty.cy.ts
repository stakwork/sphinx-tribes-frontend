describe('User creates a bounty attached to an organization', () => {
  const org: Cypress.Organization = {
    loggedInAs: 'alice',
    name: 'Alice Organization',
    description: 'An organization focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    organization: 'Alice Organization',
    title: 'Alice Bounty',
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

  it('should verify the bounty tile has the org label and is clickable', () => {
    cy.create_bounty(bounty);
    cy.wait(1000);

    cy.contains(bounty.title);
    cy.wait(1000);

    cy.contains(org.name).click();

    cy.logout(org.loggedInAs);
  });
});
