import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    css: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "src/**/*.test.{js,jsx}",
        "src/main.jsx",
        "src/**/index.js",
        "src/setupTests.js",
        "src/**/*.config.js",
        "src/**/*.d.ts",
      ],
      reporter: ["text", "html", "json-summary", "lcov"],
      thresholds: {
        lines: 40,
        functions: 40,
        branches: 30,
        statements: 40,
      },
      // No fallar el build por archivos individuales sin tests aún
      perFile: false,
    },
  },
});
