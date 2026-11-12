describe('Hivechat Flow with Mock Stakwork API', () => {
  beforeEach(() => {
    cy.mockStakworkAPI();
    cy.login('testuser'); // use your login helper
    cy.visit('/workspace/123/hivechat/456');
    cy.wait(1000);
  });

  it('Completes hivechat flow', () => {
    cy.get('[data-testid="chat-mode-button"]').click();
    cy.get('[data-testid="message-input"]').type('Lets create a new @ticket');
    cy.get('[data-testid="send-message-button"]').click();

    cy.wait('@hivechatResponse');
    cy.get('[data-testid="artifact-tab-Text"]').should('be.visible');
    cy.get('[data-testid="artifact-content-text"]').should('contain', 'Market Research');

    cy.get('[data-testid="message-input"]').clear().type('Yes sounds good');
    cy.get('[data-testid="send-message-button"]').click();

    cy.wait('@hivechatResponse');
    cy.get('[data-testid="artifact-tab-Code"]').should('be.visible').click();
    cy.get('[data-testid="artifact-content-code"]').should('contain', 'LeaderboardPage');

    cy.get('[data-testid="artifact-tab-Screen"]').click();
    cy.get('[data-testid="artifact-content-screen"]').should('be.visible');

    cy.get('[data-testid="action-dialog"]').contains('Yes').click();

    cy.wait('@hivechatResponse');
    cy.get('[data-testid="artifact-content-code"]').should('contain', 'applyPatch');

    cy.get('[data-testid="action-dialog"]').contains('Yes').click();

    cy.wait('@hivechatResponse');
    cy.get('[data-testid="message-history"]').should('contain', 'Patch applied successfully');
  });

  afterEach(() => {
    cy.logout();
  });
});