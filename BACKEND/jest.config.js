module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
  collectCoverageFrom: [
    "src/middleware/**/*.js",
    "src/utils/**/*.js",
    "src/validations/**/*.js",
    "src/routes/**/*.js",
    "!**/node_modules/**",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],
  coverageThreshold: {
    global: { lines: 60, statements: 60, functions: 65, branches: 50 },
    // Umbrales específicos por módulo crítico (NFR-SEG-4, NFR-SEG-5)
    "./src/middleware/": { lines: 90, branches: 80 },
    "./src/validations/": { lines: 90, branches: 80 },
    "./src/utils/": { lines: 80, branches: 70 },
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  testTimeout: 10000,
};
