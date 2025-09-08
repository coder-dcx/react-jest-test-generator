# React Jest Test Generator

An extension that automatically generates Jest test cases for React components with support for both React Testing Library and Enzyme.

## Features

- Generate comprehensive test cases for React components
- Support for JavaScript (.js, .jsx) and TypeScript (.ts, .tsx) files
- Command palette and context menu integration
- Configurable test file placement and naming
- Progress notifications during test generation
- AST-based component analysis for better test generation
- Automatic prop detection and sample generation
- Snapshot test support (optional)
- **Dynamic Enzyme Setup**: Automatically generates cheerio mocks and setup files for React 16 projects

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press `F5` to launch extension development host
4. Test the extension in the new VS Code window

## Usage

1. Open a React component file (.js, .jsx, .ts, .tsx)
2. Use one of these methods to generate a test:
   - Command Palette: `Ctrl+Shift+P` → "Generate Test for File"
   - Right-click in Explorer → "Generate Test for File"
   - Right-click in editor → "Generate Test for File"

## Configuration

The extension can be configured through VS Code settings:

- `reactJestGen.framework`: Choose between "jest" or "vitest"
- `reactJestGen.testingLibrary`: Choose between "rtl" (React Testing Library) or "enzyme"
- `reactJestGen.testPathPattern`: Customize test file naming and placement
- `reactJestGen.addSnapshot`: Include snapshot tests by default
- `reactJestGen.combineTests`: Combine all tests for a file into a single test file (recommended for complex files)
- `reactJestGen.include`: Glob patterns for files to include
- `reactJestGen.exclude`: Glob patterns for files to exclude

## Testing Library Support

### React Testing Library (RTL) - Default
- Modern, user-centric testing approach
- Encourages testing from user's perspective
- Generates tests using `render`, `screen`, and accessibility queries

### Enzyme Support
- Traditional testing approach with shallow/full mounting
- Provides direct access to component internals
- Useful for testing implementation details
- **Automatic Setup Generation**: When using Enzyme, the extension automatically generates required setup files

**Enzyme Test Patterns Generated:**
- **Shallow rendering**: `shallow(<Component />)` for isolated unit tests
- **Full mounting**: `mount(<Component />)` for integration tests
- **Props testing**: Direct prop access and validation
- **Component structure**: Testing child components and DOM structure
- **Event simulation**: Simulating user interactions

**Dynamic Enzyme Setup:**
When generating Enzyme tests, the extension automatically:
- Creates `__mocks__/cheerio.js` if it doesn't exist (prevents Web API conflicts)
- Creates `src/setupTests.js` with Enzyme configuration and polyfills (Jest's standard setup file)
- Automatically offers to add Jest configuration if not found in package.json
- Validates Jest configuration for proper Enzyme support

**Jest Setup File:**
The extension uses Jest's standard `src/setupTests.js` file (not `setupFilesAfterEnv` in package.json) for:
- Enzyme adapter configuration
- TextEncoder/TextDecoder polyfills
- Web API mocks (matchMedia, IntersectionObserver, etc.)
- RequestAnimationFrame mocks

**Enzyme Setup Requirements:**
To use Enzyme testing, install the required dependencies:
```bash
npm install --save-dev enzyme enzyme-adapter-react-16
```

For React 17+:
```bash
npm install --save-dev enzyme @wojtekmaj/enzyme-adapter-react-17
```

**Note:** The extension only generates the `cheerio.js` mock file dynamically. You need to manually create a Jest setup file with Enzyme configuration and polyfills.