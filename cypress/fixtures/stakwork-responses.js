export const stakworkResponses = {
  initialResponse: {
    value: {
      chatId: "cvljgu7paij1jhtehg9g",
      messageId: "cvljh5npaij1jhtehga0",
      response: "Ok here's the plan for you to review...",
      sourceWebsocketId: "52a3e86e-d466-40a4-a4a8-e88938653335",
      artifacts: [
        {
          id: "111-222-333-444",
          type: "action",
          content: {
            actionText: "",
            options: [
              {
                action_type: "chat",
                option_label: "Give me feedback",
                option_response: "textbox",
                webhook: "https://jobs.stakwork.com/customer_webhooks/v1?..."
              }
            ]
          }
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440123",
          messageId: "msg_123456",
          type: "text",
          content: {
            text_type: "markdown",
            content: "Creating a plan for market domination..."
          }
        }
      ]
    }
  },
  codeScreenResponse: {
    value: {
      chatId: "cvljgu7paij1jhtehg9g",
      messageId: "cvljh5npaij1jhtehga0",
      response: "Alright I've implemented the code below...",
      sourceWebsocketId: "52a3e86e-d466-40a4-a4a8-e88938653335",
      artifacts: [
        {
          id: "111-222-333-444",
          type: "action",
          content: {
            actionText: "I detected an error do you want to see the logs?",
            options: [
              {
                action_type: "chat",
                option_label: "Give me feedback",
                option_response: "textbox",
                webhook: "https://jobs.stakwork.com/customer_webhooks/v1?..."
              },
              {
                action_type: "button",
                option_label: "Yes",
                option_response: "Yes",
                webhook: "https://jobs.stakwork.com/customer_webhooks/v1?..."
              }
            ]
          }
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          messageId: "msg_123456",
          type: "visual",
          content: {
            visual_type: "screen",
            url: "https://community.sphinx.chat/leaderboard"
          }
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440123",
          messageId: "msg_123456",
          type: "text",
          content: {
            text_type: "code",
            content: "import React, { useState } from 'react';..."
          }
        }
      ]
    }
  },
  logsResponse: {
    value: {
      chatId: "cvljgu7paij1jhtehg9g",
      messageId: "cvljh5npaij1jhtehga0",
      response: "OK here's the logs, they should be streaming through now...",
      sourceWebsocketId: "52a3e86e-d466-40a4-a4a8-e88938653335",
      artifacts: [
        {
          id: "111-222-333-444",
          type: "action",
          content: {
            actionText: "how about we fix this with patch 1523.patch",
            options: [
              {
                action_type: "chat",
                option_label: "Give me feedback",
                option_response: "textbox",
                webhook: "https://jobs.stakwork.com/customer_webhooks/v1?..."
              },
              {
                action_type: "button",
                option_label: "Yes",
                option_response: "Yes",
                webhook: "https://jobs.stakwork.com/customer_webhooks/v1?..."
              }
            ]
          }
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440123",
          messageId: "msg_123456",
          type: "text",
          content: {
            text_type: "code",
            language: "typescript",
            content: "function applyPatch(...) { ... }"
          }
        }
      ]
    }
  },
  finalResponse: {
    value: {
      chatId: "cvljgu7paij1jhtehg9g",
      messageId: "cvljh5npaij1jhtehga0",
      response: "Patch applied successfully! The fix has been deployed."
    }
  }
};