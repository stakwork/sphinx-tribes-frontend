describe('User creates a bounties attached to an organization', () => {
  const org: Cypress.Organization = {
    loggedInAs: 'alice',
    name: 'Umer Org-34',
    description: 'An organization focused on amazing projects.',
    website: 'https://amazing.org',
    github: 'https://github.com/amazing'
  };

  const bounty: Cypress.Bounty = {
    organization: 'Umer Org-34',
    title: 'Bounty',
    category: 'Web development',
    coding_language: ['Typescript', 'Javascript', 'Lightning'],
    description: 'This is available',
    amount: '123',
    tribe: 'Amazing Org Tribe',
    estimate_session_length: 'Less than 3 hour',
    estimate_completion_date: '09/09/2024',
    deliverables: 'We are good to go man',
    assign: 'bob'
  };

  beforeEach(() => {
    cy.login(org.loggedInAs);
    cy.wait(1000);
    cy.contains(org.loggedInAs).click();
    cy.wait(1000);
    cy.create_org(org);
    cy.wait(1000);
  });

  it('should display bounties in the organization list with organization label', () => {
    for (let i = 1; i <= 4; i++) {
      const updatedBounty = { ...bounty, title: `Bounty ${i}` };
      cy.create_bounty(updatedBounty);
      cy.wait(1000);
    }

    cy.contains(org.loggedInAs).click();
    cy.wait(1000);

    cy.contains(org.name).contains('Manage').click();
    cy.wait(1000);

    cy.get('a[href*="/org/bounties"]').then(($link: JQuery<HTMLElement>) => {
      const modifiedHref = $link.attr('href');
      cy.wrap($link).invoke('removeAttr', 'target');
      cy.wrap($link).click();
      cy.url().should('include', modifiedHref);
    });
    cy.wait(1000);

    for (let i = 1; i <= 4; i++) {
      cy.contains(`Bounty ${i}`, { timeout: 10000 }).should('exist');
    }

    cy.contains(org.name).should('exist');
    cy.wait(600);

    cy.contains(org.description).should('exist');
    cy.wait(600);

    cy.contains('Website').should('exist');
    cy.wait(600);

    // click outside the modal
    cy.get('body').click(0, 0);
    cy.logout(org.loggedInAs);
  });
});
