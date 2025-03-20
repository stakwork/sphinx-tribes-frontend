describe('Authentication Redirects', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should redirect to profile page after login', () => {
    cy.visit('http://localhost:3007');
    cy.wait(3000);

    cy.contains('Sign in').click();

    let user;
    let challenge;
    let token;
    let info;

    cy.fixture('nodes.json').then((json) => {
      user = json[0];
      const userAlias = user.alias;

      cy.get('[data-challenge]')
        .invoke('attr', 'data-challenge')
        .then((value) => {
          const array = value?.split('&');
          if (array && array.length === 4) {
            challenge = array[2].substring(10);
          }
        });

      cy.request({
        method: 'POST',
        url: `${user.external_ip}/verify_external`,
        headers: {
          'x-user-token': `${user.authToken}`
        }
      }).then((response) => {
        ({ token } = response.body.response);
        ({ info } = response.body.response);
      });

      cy.request({
        method: 'GET',
        url: `${user.external_ip}/signer/U98BoaW54IFZlcmlmaWNhdGlvbg==`,
        headers: {
          'x-user-token': `${user.authToken}`
        }
      }).then((response) => {
        info.url = `${user.external_ip}`;
        info['verification_signature'] = response.body.response.sig;

        cy.request({
          method: 'POST',
          url: `http://localhost:13000/verify/${challenge}?token=${token}`,
          body: info
        });

        cy.url().should('include', '/p/').and('include', '/workspaces');
        cy.contains(userAlias).should('exist');
      });
    });
  });

  it('should redirect to homepage after logout', () => {
    cy.fixture('nodes.json').then((json) => {
      const user = json[0];
      cy.login(user.alias);

      cy.visit(`http://localhost:3007/p/${user.pubkey}/workspaces`);

      cy.contains(user.alias).click();

      cy.contains('Sign out').click();

      cy.url().should('eq', 'http://localhost:3007/');

      cy.contains('Sign in').should('be.visible');
    });
  });
});
