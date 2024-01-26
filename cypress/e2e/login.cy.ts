describe('User Login', () => {
  it('User gets to login into the app', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Sign in').click();

    let challenge;
    let token;
    let info;
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
      url: 'http://localhost:3001/verify_external',
      headers: {
        'x-user-token': 'QycGOV0D7/lcegVqB2BY'
      }
    }).then((response) => {
      token = response.body.response.token;
      info = response.body.response.info;
    });

    cy.request({
      method: 'GET',
      url: 'http://localhost:3001/signer/U98BoaW54IFZlcmlmaWNhdGlvbg==',
      headers: {
        'x-user-token': 'QycGOV0D7/lcegVqB2BY'
      }
    }).then((response) => {
      info.url = 'http://localhost:3001';
      info['verification_signature'] = response.body.response.sig;

      cy.request({
        method: 'POST',
        url: `http://localhost:13000/verify/${challenge}?token=${token}`,
        body: info
      }).then((response) => {});
    });

    cy.contains("alice").eq(0)
  });
});
