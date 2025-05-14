const baseConfig = require('./cypress.config');

module.exports = {
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: 'https://test.sphinx.chat', // Placeholder
    env: {
      useMocks: true
    }
  }
};