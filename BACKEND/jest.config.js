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
    global: { lines: 40, statements: 40, functions: 60, branches: 30 },
    // Umbrales específicos por módulo crítico (NFR-SEG-4, NFR-SEG-5)
    "./src/middleware/": { lines: 90, branches: 40 },
    "./src/validations/": { lines: 70 },
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  testTimeout: 10000,
};
