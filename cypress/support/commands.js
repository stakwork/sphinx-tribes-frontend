import { stakworkResponses } from '../fixtures/stakwork-responses';

Cypress.Commands.add('mockStakworkAPI', () => {
  if (Cypress.env('useMocks') === false) {
    return;
  }
  let responseCounter = 0;
  cy.intercept('POST', '**/hivechat/response', (req) => {
    let mockResponse;
    if (responseCounter === 0) {
      mockResponse = stakworkResponses.initialResponse;
    } else if (responseCounter === 1) {
      mockResponse = stakworkResponses.codeScreenResponse;
    } else if (responseCounter === 2) {
      mockResponse = stakworkResponses.logsResponse;
    } else {
      mockResponse = stakworkResponses.finalResponse;
    }
    responseCounter++;
    req.reply({ statusCode: 200, body: mockResponse });
  }).as('hivechatResponse');
  cy.intercept('POST', '**/customer_webhooks/**', {
    statusCode: 200,
    body: { success: true }
  }).as('webhookAction');
});

// Use provided login/logout commands
Cypress.Commands.add('login', (alice) => {
  cy.login(alice); // Leverage existing command from setupCypressTest.md
});

Cypress.Commands.add('logout', () => {
  cy.logout('alice');
});