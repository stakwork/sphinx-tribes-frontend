const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3007',
    env: {
      useMocks: true
    }
  }
});