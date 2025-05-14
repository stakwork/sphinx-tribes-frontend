export const stakworkResponses = {
  // First response - Text artifact with action
  initialResponse: {
    value: {
      chatId: "cvljgu7paij1jhtehg9g",
      messageId: "cvljh5npaij1jhtehga0",
      response: "Ok here's the plan for you to review. Let me know what you think and we can move forwards from here.",
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
                webhook: "https://jobs.stakwork.com/customer_webhooks/v1?webhook_step_name=webhook1&project_id=105376281&customer_id=7294&webhook_source=Hive"
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
            content: "Creating a plan for market domination in the sock industry requires a strategic approach that includes understanding market trends, identifying unique selling propositions, and leveraging effective marketing and distribution strategies. Here's a high-level plan:\n\n### 1. Market Research and Analysis\n- **Identify Trends:** Conduct thorough market research to understand current trends, consumer preferences, and emerging technologies in the sock industry (e.g., sustainable materials, smart socks with sensors).- **Competitive Analysis:** Analyze key competitors to understand their strengths, weaknesses, pricing models, and market positioning.\n- **Target Audience:** Define and segment your target audience (e.g., athletes, fashion-conscious consumers, eco-friendly buyers).\n\n### 2. Product Development\n\n- **Unique Selling Proposition (USP):** Develop a unique angle for your socks, such as innovative materials, customizable designs, or enhanced comfort features.\n- **Quality and Design:** Focus on high-quality materials and appealing design to differentiate your products from competitors.\n- **Sustainability:** Incorporate sustainable practices and materials to appeal to environmentally conscious consumers.\n\n### 3. Branding and Positioning\n\n- **Brand Identity:** Create a strong, recognizable brand identity that resonates with your target audience.- **Storytelling:** Use storytelling to communicate your brand values and mission, emphasizing your unique offerings and benefits.\n\n### 4. Distribution Strategy\n\n- **Online Presence:** Develop a robust online sales platform with a user-friendly e-commerce site and leverage marketplaces like Amazon and Etsy.\n- **Retail Partnerships:** Establish partnerships with retail stores and boutiques to increase visibility and accessibility.\n- **Direct-to-Consumer (DTC):** Consider a DTC model to build a direct relationship with customers, allowing for personalized marketing and feedback collection.\n\n### 5. Marketing and Promotion\n\n- **Digital Marketing:** Utilize SEO, content marketing, social media advertising, and influencer partnerships to reach a broader audience.\n\n- **Promotions and Loyalty Programs:** Offer promotions, discounts, and loyalty programs to attract and retain customers.\n\n- **Community Engagement:** Build an online community around your brand through social media interaction and user-generated content.\n\n### 6. Operational Excellence\n\n- **Supply Chain Efficiency:** Optimize your supply chain to reduce costs and improve delivery times.\n\n\n\n- **Scalability:** Develop scalable business processes to accommodate growth and expansion.\n\n### 7. Customer Experience.\n\nCan we keep going here does the page scale and scroll?\n\nCan we keep going here does the page scale and scroll?\n\nCan we keep going here does the page scale and scroll?"
          }
        }
      ]
    }
  },
  
  // Second response - Code and Screen artifacts with error dialog
  codeScreenResponse: {
    value: {
      chatId: "cvljgu7paij1jhtehg9g",
      messageId: "cvljh5npaij1jhtehga0",
      response: "Alright I've implemented the code below and fired up a VM which you can see in the screen tab.",
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
                webhook: "https://jobs.stakwork.com/customer_webhooks/v1?webhook_step_name=webhook2&project_id=105376281&customer_id=7294&webhook_source=Hive"
              },
              {
                action_type: "button",
                option_label: "Yes",
                option_response: "Yes",
                webhook: "https://jobs.stakwork.com/customer_webhooks/v1?webhook_step_name=webhook2&project_id=105376281&customer_id=7294&webhook_source=Hive"
              },
              {
                action_type: "button",
                option_label: "Ok",
                option_response: "Ok",
                webhook: "https://jobs.stakwork.com/customer_webhooks/v1?webhook_step_name=webhook2&project_id=105376281&customer_id=7294&webhook_source=Hive"
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
            code_metadata: {
              File: "stakwork/sphinx-tribes/handlers/bounty.go",
              Change: "Add GetPeopleCount handler function",
              Action: "Modify"
            },
            content: "import React, { useState, useEffect } from 'react';\nimport { Search } from 'lucide-react';\n\nconst LeaderboardPage = () => {\n  // Sample data - in a real app, this would come from an API\n  const [players, setPlayers] = useState([\n    { id: 1, rank: 1, name: \"Alex Johnson\", score: 9850, wins: 42, losses: 5, winRate: 89, team: \"Cosmic Crushers\" },\n    { id: 2, rank: 2, name: \"Taylor Swift\", score: 9720, wins: 40, losses: 8, winRate: 83, team: \"Melody Masters\" },\n    // ... additional player data\n  ]);\n\n  // Additional component code...\n};"
          }
        }
      ]
    }
  },
  
  // Third response - After clicking "Yes" on error dialog
  logsResponse: {
    value: {
      chatId: "cvljgu7paij1jhtehg9g",
      messageId: "cvljh5npaij1jhtehga0",
      response: "OK here's the logs, they should be streaming through now. \r\n\r\nI've created a code patch for you based on the logs observed, check it out and let me know if you want to apply and depoy.",
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
                webhook: "https://jobs.stakwork.com/customer_webhooks/v1?webhook_step_name=webhook3&project_id=105376281&customer_id=7294&webhook_source=Hive"
              },
              {
                action_type: "button",
                option_label: "Yes",
                option_response: "Yes",
                webhook: "https://jobs.stakwork.com/customer_webhooks/v1?webhook_step_name=webhook3&project_id=105376281&customer_id=7294&webhook_source=Hive"
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
            content: "function applyPatch(fileSystem) {\n  const targetFile = fileSystem.getFile('/src/core/utils.js');\n  const buggyLine = targetFile.findLine('return obj.data.results.filter(x => x);');\n  targetFile.replaceLine(buggyLine, 'return obj?.data?.results?.filter(x => x) || [];');\n  console.log('PATCH-001: Fixed null reference exception in results filtering');\n}"
          }
        }
      ]
    }
  },
  
  // Fourth response - Final confirmation (empty for simplicity)
  finalResponse: {
    value: {
      chatId: "cvljgu7paij1jhtehg9g",
      messageId: "cvljh5npaij1jhtehga0",
      response: "Patch applied successfully! The fix has been deployed.",
      sourceWebsocketId: "52a3e86e-d466-40a4-a4a8-e88938653335",
    }
  }
};