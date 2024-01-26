describe('User Login', () => {
  it('User gets to login into the app', () => {
    let user;
    const userAlias = 'bob';
    let challenge;
      let token;
      let info;

    cy.fixture('nodes.json').then((json) => {

      for (let i = 0; i < json.length; i++) {
        if (json[i].alias === userAlias) {
          user = json[i];
        }
      }
      
      cy.visit('http://localhost:3000');
      cy.contains('Sign in').click();

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
        token = response.body.response.token;
        info = response.body.response.info;
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
        }).then((response) => {});
      });

      cy.contains(userAlias).eq(0);
    });
  });
});
