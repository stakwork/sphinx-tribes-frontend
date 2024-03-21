describe('User Search and Profile Navigation', () => {
  let activeUser = 'alice';

  beforeEach(() => {
    cy.login(activeUser);
    cy.wait(1000);
  });

  it('should assert that 3 users are visible and perform user searches and navigations', () => {
    cy.contains('People').click();
    cy.wait(2000);

    const users = ['alice', 'carol', 'bob'];
    users.forEach((user: any) => {
      cy.get('[data-testid="person-card-desktop"]').contains(user).should('be.visible');
    });

    cy.get('input').type('carol');
    cy.wait(1000);

    cy.get('[data-testid="person-card-desktop"]')
      .contains('carol')
      .should('exist')
      .and('be.visible');
    cy.wait(600);

    cy.get('input').eq(0).clear({ force: true }).type('bob');
    cy.wait(600);

    cy.get('[data-testid="person-card-desktop"]').contains('bob').should('exist').and('be.visible');
    cy.wait(600);

    cy.contains('bob').click();
    cy.wait(1000);

    // Assert that it takes you to Bob Profile Page
    cy.get('[data-testid="pubkey_user"]')
      .contains('02a38857848aca6b32ebcc3...')
      .should('exist')
      .and('be.visible');
    cy.wait(600);

    cy.get('[data-testid="copy-button"]').contains('COPY').should('exist').and('be.visible');
    cy.wait(600);

    cy.get('input').eq(0).clear({ force: true }).type('carol');
    cy.wait(600);

    cy.get('[data-testid="person-card-small"]').contains('carol').should('exist').and('be.visible');
    cy.wait(600);

    cy.get('[data-testid="person-card-small"]').click();
    cy.wait(600);

    // Assert that it takes you to Carol Profile Page
    cy.get('[data-testid="pubkey_user"]')
      .contains('0364c05cbcbb9612036cc66...')
      .should('exist')
      .and('be.visible');
    cy.wait(600);

    cy.get('[data-testid="copy-button"]').contains('COPY').should('exist').and('be.visible');
    cy.wait(600);

    cy.get('input').eq(0).clear({ force: true });
    cy.wait(600);

    cy.get('body').click(0, 0);
    cy.logout(activeUser);
  });
});
