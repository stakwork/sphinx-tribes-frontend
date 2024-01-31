declare namespace Cypress {
  interface Chainable {
    login(userAlias: string): void;
  }
}
