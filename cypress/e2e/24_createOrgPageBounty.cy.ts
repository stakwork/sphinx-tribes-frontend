describe('Create org bounty from Organization Page', () => {
  const OrgName = 'Ali SoftDev';

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

  const orgPageBounty: Cypress.Bounty = {
    title: 'Test#2',
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
    cy.contains(org.loggedInAs).click();
    cy.wait(1000);
    cy.create_org(org);
    cy.wait(1000);
  });

  it('should verify  bounty tile displays the organization label is clickable and redirects the user to the organizations bounty page and create a new bounty', () => {
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

    cy.contains('Post a Bounty').click();
    cy.contains('Start').click();

    cy.get('[data-testid="Organization"]').contains(org.name).should('exist').and('be.visible');
    cy.wait(1000);

    cy.get('[data-testid="close-btn"]').click();
    cy.wait(1000);

    cy.create_orgBounty(orgPageBounty);
    cy.wait(5000);

    cy.contains(orgPageBounty.title).should('exist').and('be.visible');
    cy.wait(5000);

    cy.logout(org.loggedInAs);
  });
});
