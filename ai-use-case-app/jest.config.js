module.exports = {
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "<rootDir>/node_modules/jest-css-modules",
  },
  testEnvironment: "jsdom",
  collectCoverage: true,
  coverageReporters: ["lcov", "text", "text-summary"],
  coverageDirectory: "coverage",
};
