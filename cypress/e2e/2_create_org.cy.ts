describe('Create Organization', () => {
  it('Creating an Organization', () => {
    cy.login('carol');
    cy.wait(1000);

    cy.create_org({
      loggedInAs: 'carol',
      name: 'New Organization 8',
      description: 'We are testing out our oeganization',
      website: 'https://community.sphinx.chat',
      github: 'https://github.com/stakwork/sphinx-tribes-frontend'
    });

    cy.logout('carol');
  });
});
