declare namespace Cypress {
  interface Chainable {
    login(userAlias: string): void;
    logout(userAlias: string): void
  }
}
