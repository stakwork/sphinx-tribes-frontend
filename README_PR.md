## ✅ PR: Add Cypress test with mock Stakwork endpoints for Hivechat Chat Mode

**Summary:**
- Adds fixture file with mock Stakwork responses
- Adds Cypress command to intercept and mock `/hivechat/response` and webhook endpoints
- New e2e test covering text, code & screen artifacts, and action dialogs
- Configurable mock/real endpoints via `useMocks`

**Why:** Enable consistent backend-independent tests.  
Resolves part of https://github.com/stakwork/sphinx-tribes-frontend/pull/1395

**How to run:**
```bash
yarn cy:open       # UI mode
yarn cy:run        # headless
```

Toggle mock/real: edit `cypress.config.js` → `env.useMocks`

Ready for review 🚀
