import { defineConfig } from 'cypress';

export default defineConfig({
  viewportWidth: 1800,
  viewportHeight: 1200,
  video: true,
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
  responseTimeout: 30000,
  pageLoadTimeout: 60000,
  e2e: {
    retries: {
      runMode: 3,
      openMode: 1
    },
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 5,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  }
});
