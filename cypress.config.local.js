const baseConfig = require('./cypress.config');

module.exports = {
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    baseUrl: 'http://localhost:3000',
    env: {
      useMocks: true
    }
  }
};