// LNURL PublicKey
// 0430a9b0f2a0bad383b1b3a1989571b90f7486a86629e040c603f6f9ecec857505fd2b1279ccce579dbe59cc88d8d49b7543bd62051b1417cafa6bb2e4fd011d30

describe('Login with LNURL', () => {
  it('User trying to login with LNURL', () => {
    cy.lnurl_login().then((value) => {
      cy.wait(1000);

      cy.logout(value.substring(0, 5)); // NOTE: to logout LNURL auth use the first four letters of the pubkey as the userAlias.
    });
  });
});
