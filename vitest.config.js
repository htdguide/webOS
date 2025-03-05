import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,   // <-- enable global expect, describe, it, etc.
    environment: "jsdom",
    // optional but recommended to keep setup code in a single file:
    // setupFiles: ['./setupTests.js']
  },
});
