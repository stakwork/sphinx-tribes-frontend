import { defineConfig } from "cypress";

export default defineConfig({
  viewportWidth: 1800,
  viewportHeight: 1200,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
