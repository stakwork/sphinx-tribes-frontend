const profileImagePngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';

describe('Edit Profile Image And Price To Meet', () => {
  it('edits profile image and price to meet', () => {
    const userAlias = 'carol';
    const priceToMeet = '1234';

    cy.login(userAlias);
    cy.wait(1000);

    cy.contains(userAlias).click();
    cy.contains('Edit Profile').click();

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from(profileImagePngBase64, 'base64'),
        fileName: 'profile-avatar.png',
        mimeType: 'image/png',
        lastModified: Date.now()
      },
      { force: true }
    );

    cy.contains('label', 'Price to Meet').parent().find('input').clear().type(priceToMeet);

    cy.contains('Save').click();

    cy.contains('Saved.').should('exist');

    cy.logout(userAlias);
  });
});
