import { stakworkResponses } from '../fixtures/stakwork-responses';

Cypress.Commands.add('mockStakworkAPI', () => {
  if (Cypress.env('useMocks') === false) return;

  let responseCounter = 0;

  cy.intercept('POST', '**/hivechat/response', (req) => {
    let res = stakworkResponses.finalResponse;
    if (responseCounter === 0) res = stakworkResponses.initialResponse;
    else if (responseCounter === 1) res = stakworkResponses.codeScreenResponse;
    else if (responseCounter === 2) res = stakworkResponses.logsResponse;
    responseCounter++;
    req.reply({ statusCode: 200, body: res });
  }).as('hivechatResponse');

  cy.intercept('POST', '**/customer_webhooks/**', {
    statusCode: 200,
    body: { success: true }
  }).as('webhookAction');
});