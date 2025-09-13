// Example Jest configuration for React 16 with Enzyme and Node.js compatibility
// This configuration resolves common issues with Enzyme and Node.js built-in modules

module.exports = {
  // Test environment
  testEnvironment: "jsdom",

  // Transform files using babel-jest
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },

  // Don't transform node_modules except for specific packages that need it
  transformIgnorePatterns: [
    "node_modules/(?!enzyme-adapter-react-16|@mui|@emotion)"
  ],

  // Module name mapping to handle imports and mocks
  moduleNameMapper: {
    // Style files
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    
    // Asset files
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
    
    // Cheerio mock (fixes Enzyme compatibility issues)
    "^cheerio$": "<rootDir>/__mocks__/cheerio.js",
    "^cheerio/(.*)$": "<rootDir>/__mocks__/cheerio.js",
    
    // Node.js built-in modules compatibility (fixes node:stream errors)
    "^node:(.*)$": "$1",
    
    // Material-UI mocks (if using Material-UI)
    "^@mui/material/(.*)$": "<rootDir>/__mocks__/@mui/material/$1",
    "^@mui/icons-material/(.*)$": "<rootDir>/__mocks__/@mui/icons-material/$1",
    "^@material-ui/core/(.*)$": "<rootDir>/__mocks__/@material-ui/core/$1",
    "^@material-ui/icons/(.*)$": "<rootDir>/__mocks__/@material-ui/icons/$1",
    
    // Common library mocks
    "^react-router-dom$": "<rootDir>/__mocks__/react-router-dom.js",
    "^axios$": "<rootDir>/__mocks__/axios.js"
  },

  // Setup files to run after Jest is configured
  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.js"
  ],

  // Test file patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)",
    "<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)",
    "<rootDir>/__tests__/**/*.(js|jsx|ts|tsx)"
  ],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/index.js",
    "!src/setupTests.js"
  ],

  // File extensions Jest should handle
  moduleFileExtensions: [
    "js",
    "jsx",
    "ts",
    "tsx",
    "json",
    "node"
  ],

  // Coverage directory
  coverageDirectory: "coverage",

  // Coverage reporters
  coverageReporters: [
    "text",
    "lcov",
    "html"
  ]
};