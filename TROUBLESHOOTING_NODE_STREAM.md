# Fix for "ENOENT: no such file or directory, open node:stream" Error

This error occurs because Jest cannot resolve Node.js built-in modules when they use the `node:` protocol. Here's how to fix it:

## Quick Fix for RC16-IC Project

Add this Jest configuration to your `package.json` in the RC16-IC project:

```json
{
  "jest": {
    "testEnvironment": "jsdom",
    "transform": {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    },
    "transformIgnorePatterns": [
      "node_modules/(?!enzyme-adapter-react-16)"
    ],
    "moduleNameMapper": {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      "^cheerio$": "<rootDir>/__mocks__/cheerio.js",
      "^cheerio/(.*)$": "<rootDir>/__mocks__/cheerio.js",
      "^node:(.*)$": "$1",
      "^@material-ui/core/(.*)$": "<rootDir>/__mocks__/@material-ui/core/$1",
      "^@material-ui/icons/(.*)$": "<rootDir>/__mocks__/@material-ui/icons/$1"
    },
    "setupFilesAfterEnv": [
      "<rootDir>/src/setupTests.js"
    ],
    "testMatch": [
      "<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)",
      "<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)"
    ],
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/**/*.d.ts"
    ]
  }
}
```

## Key Fix: Node.js Module Mapping

The critical line that fixes the `node:stream` error is:

```json
"^node:(.*)$": "$1"
```

This maps `node:stream` to `stream`, `node:fs` to `fs`, etc.

## Alternative: Create React App Override

If you're using Create React App and can't modify Jest config directly, create a `jest.config.js` file in your project root:

```javascript
module.exports = {
  ...require('react-scripts/scripts/utils/createJestConfig')(),
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^cheerio$": "<rootDir>/__mocks__/cheerio.js",
    "^cheerio/(.*)$": "<rootDir>/__mocks__/cheerio.js",
    "^node:(.*)$": "$1",
    "^@material-ui/core/(.*)$": "<rootDir>/__mocks__/@material-ui/core/$1",
    "^@material-ui/icons/(.*)$": "<rootDir>/__mocks__/@material-ui/icons/$1"
  }
};
```

## Required Mock Files

Create these mock files in your project:

### 1. `__mocks__/cheerio.js`

```javascript
// Mock cheerio to prevent Node.js API issues
const createCheerioElement = () => ({
  html: jest.fn(() => ''),
  text: jest.fn(() => ''),
  find: jest.fn(() => createCheerioCollection()),
  attr: jest.fn(() => ''),
  children: jest.fn(() => createCheerioCollection()),
  parent: jest.fn(() => createCheerioElement()),
  // ... (full mock from extension)
});

const createCheerioCollection = () => ({
  ...createCheerioElement(),
  length: 0,
});

module.exports = {
  load: jest.fn((html) => createCheerioElement()),
  html: jest.fn(() => ''),
  text: jest.fn(() => ''),
};
```

## Dependencies

Make sure you have these dependencies installed:

```bash
npm install --save-dev enzyme enzyme-adapter-react-16 identity-obj-proxy
```

## Verification

After applying these changes, your tests should run without the `node:stream` error.