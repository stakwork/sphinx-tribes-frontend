const baseConfig = require('./cypress.config');

module.exports = {
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: 'https://people.sphinx.chat',
    env: {
      useMocks: false
    }
  }
};