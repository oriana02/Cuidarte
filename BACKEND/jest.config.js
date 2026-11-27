module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"], // <-- Nueva línea
  collectCoverageFrom: [
    "src/middleware/**/*.js",
    "src/utils/**/*.js",
    "src/validations/**/*.js",
    "src/routes/**/*.js",
    "!**/node_modules/**",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  testTimeout: 10000,
};
