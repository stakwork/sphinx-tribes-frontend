import { defineConfig } from "cypress";

export default defineConfig({
  viewportWidth: 1800,
  viewportHeight: 1200,
  video: true,
  e2e: {
					retries: {
									runMode: 3,
									openMode: 1,
					},
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
