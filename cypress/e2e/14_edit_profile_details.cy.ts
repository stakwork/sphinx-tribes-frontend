describe('Edit Profile Details', () => {
  it('edits profile description, socials, and coding languages', () => {
    const userAlias = 'carol';
    const description = 'Updated Cypress profile description';
    const twitter = 'cypress_profile';
    const github = 'cypress-profile';

    cy.login(userAlias);
    cy.wait(1000);

    cy.contains(userAlias).click();
    cy.contains('Edit Profile').click();

    cy.contains('label', 'Description').parent().find('textarea').clear().type(description);
    cy.contains('label', 'Twitter').parent().find('input').clear().type(twitter);
    cy.contains('label', 'Github').parent().find('input').clear().type(github);

    cy.contains('Coding Languages').click({ force: true });
    cy.contains('Javascript').click({ force: true });
    cy.contains('Coding Languages').click({ force: true });

    cy.contains('Save').click();

    cy.contains('Saved.').should('exist');
    cy.contains(description).should('exist');

    cy.logout(userAlias);
  });
});
