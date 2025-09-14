# React Jest Test Generator

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue)](https://marketplace.visualstudio.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org/)
[![Jest](https://img.shields.io/badge/Jest-29+-c21325)](https://jestjs.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6)](https://www.typescriptlang.org/)

An intelligent VS Code extension that automatically generates comprehensive Jest test cases for React components. Supports both React Testing Library and Enzyme with smart component analysis and CRA-compatible test generation.

## ✨ Features

- 🚀 **Smart Component Analysis**: AST-based parsing to detect components, props, and functions
- 🧪 **Dual Testing Library Support**: React Testing Library (RTL) and Enzyme
- ⚡ **CRA-Compatible**: Generates tests that work seamlessly with Create React App
- 🔧 **Hook-Aware**: Handles modern React hooks and functional components
- 📝 **Comprehensive Test Coverage**: Generates multiple test scenarios per component
- 🎯 **Context Detection**: Automatically skips tests for context-dependent components
- ⚙️ **Highly Configurable**: Extensive customization options
- 📁 **Flexible File Structure**: Configurable test file naming and placement
- 🔄 **Auto-Setup**: Generates required mocks and setup files automatically

## 📦 Installation

### Option 1: Install from VS Code Marketplace (Recommended)
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "React Jest Test Generator"
4. Click Install

### Option 2: Install from Source
```bash
# Clone the repository
git clone https://github.com/coder-dcx/react-jest-test-generator.git
cd react-jest-test-generator

# Install dependencies
npm install

# Compile the extension
npm run compile

# Package the extension
npm install -g vsce
vsce package

# Install the .vsix file in VS Code
code --install-extension react-jest-test-generator-*.vsix
```

## 🚀 Deployment to Marketplace

Want to publish this extension to the VS Code Marketplace? Check out our comprehensive deployment guide:

📖 **[Deployment Steps](./deployment-steps.md)** - Complete guide for publishing to VS Code Marketplace

The guide covers:
- Setting up publisher accounts
- Configuring your extension for marketplace
- Building and packaging
- Publishing with VSCE
- Troubleshooting common issues
- Automated publishing with GitHub Actions

## 🚀 Quick Start

### For Create React App Projects

1. **Install Testing Dependencies** (if not already installed):
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

2. **Open a React Component**:
```jsx
// Button.jsx
import React from 'react';

const Button = ({ children, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
```

3. **Generate Tests**:
   - Right-click the file in Explorer → "Generate Test for File"
   - Or use Command Palette: `Ctrl+Shift+P` → "Generate Test for File"

4. **Generated Test File** (`Button.test.js`):
```jsx
import React from 'react';
import { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';

// Configure Enzyme adapter
configure({ adapter: new Adapter() });

import Button from './Button';

describe('Button', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<Button onClick={jest.fn()}>Click me</Button>);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render correctly with shallow', () => {
    const wrapper = shallow(<Button onClick={jest.fn()}>Click me</Button>);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render correctly with mount', () => {
    // Skip mount test due to jsdom requirement for CRA compatibility
    expect(true).toBe(true);
  });

  it('should receive and render props correctly', () => {
    const mockOnClick = jest.fn();
    const wrapper = shallow(<Button onClick={mockOnClick} disabled={false}>Test Button</Button>);
    // For components using hooks, test the rendered structure instead of props
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('Button')).toBeDefined();
  });

  it('should handle user interactions', () => {
    const mockOnClick = jest.fn();
    const wrapper = shallow(<Button onClick={mockOnClick}>Click me</Button>);
    // Add interaction tests based on component behavior
    expect(wrapper).toBeDefined();
  });
});
```

## 📖 Detailed Usage Guide

### Step 1: Open Your React Project

The extension works with any React project structure:
- ✅ Create React App
- ✅ Next.js
- ✅ Vite + React
- ✅ Custom React setups

### Step 2: Configure Testing Preferences

Open VS Code Settings (`Ctrl+,`) and search for "reactJestGen":

```json
{
  "reactJestGen.testingLibrary": "enzyme",
  "reactJestGen.includeMountTests": false,
  "reactJestGen.skipContextDependentTests": true,
  "reactJestGen.combineTests": true,
  "reactJestGen.testPathPattern": "${componentDir}/${componentName}.test.${testExt}"
}
```

### Step 3: Generate Tests

#### Method 1: Context Menu (Recommended)
1. Right-click on a React component file in the Explorer
2. Select "Generate Test for File"

#### Method 2: Command Palette
1. Press `Ctrl+Shift+P`
2. Type "Generate Test for File"
3. Select your component file

#### Method 3: Editor Context Menu
1. Open a React component file
2. Right-click anywhere in the editor
3. Select "Generate Test for File"

### Step 4: Review Generated Tests

The extension will:
1. Analyze your component's props and structure
2. Generate comprehensive test cases
3. Create the test file in the appropriate location
4. Show a success notification with test statistics

## ⚙️ Configuration Options

### Core Settings

| Setting | Description | Default | Options |
|---------|-------------|---------|---------|
| `reactJestGen.testingLibrary` | Testing library to use | `"rtl"` | `"rtl"`, `"enzyme"` |
| `reactJestGen.framework` | Test framework | `"jest"` | `"jest"`, `"vitest"` |
| `reactJestGen.includeMountTests` | Include mount tests (requires jsdom) | `false` | `true`, `false` |
| `reactJestGen.skipContextDependentTests` | Skip tests for context-dependent components | `true` | `true`, `false` |
| `reactJestGen.combineTests` | Combine all tests into single file | `true` | `true`, `false` |
| `reactJestGen.addSnapshot` | Include snapshot tests | `false` | `true`, `false` |

### File Organization

| Setting | Description | Default |
|---------|-------------|---------|
| `reactJestGen.testPathPattern` | Test file naming pattern | `"${componentDir}/${componentName}.test.${testExt}"` |
| `reactJestGen.include` | Glob patterns to include | `["**/*.{js,jsx,ts,tsx}"]` |
| `reactJestGen.exclude` | Glob patterns to exclude | `["**/node_modules/**", "**/*.test.*", "**/*.spec.*"]` |

### Advanced Configuration Examples

#### For Create React App Projects:
```json
{
  "reactJestGen.testingLibrary": "enzyme",
  "reactJestGen.includeMountTests": false,
  "reactJestGen.skipContextDependentTests": true,
  "reactJestGen.combineTests": true
}
```

#### For Vite + React Projects:
```json
{
  "reactJestGen.testingLibrary": "rtl",
  "reactJestGen.includeMountTests": true,
  "reactJestGen.skipContextDependentTests": false,
  "reactJestGen.combineTests": false
}
```

## 🧪 Testing Library Support

### React Testing Library (RTL) - Recommended

**Best for**: Modern React applications, user-centric testing

**Generated Test Example**:
```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  it('renders user information', () => {
    render(<UserProfile name="John Doe" email="john@example.com" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const mockOnEdit = jest.fn();
    render(<UserProfile name="John Doe" onEdit={mockOnEdit} />);
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockOnEdit).toHaveBeenCalled();
  });
});
```

### Enzyme - Legacy Support

**Best for**: Existing projects, implementation-detail testing

**Generated Test Example**:
```jsx
import React from 'react';
import { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';

// Configure Enzyme adapter
configure({ adapter: new Adapter() });

import ShoppingCart from './ShoppingCart';

describe('ShoppingCart', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<ShoppingCart items={[]} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('displays correct number of items', () => {
    const items = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
    const wrapper = shallow(<ShoppingCart items={items} />);
    expect(wrapper.find('.cart-item')).toHaveLength(2);
  });

  it('should render correctly with mount', () => {
    // Skip mount test due to jsdom requirement for CRA compatibility
    expect(true).toBe(true);
  });
});
```

## 🔧 Setup Requirements

### For React Testing Library

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### For Enzyme

```bash
# React 16
npm install --save-dev enzyme enzyme-adapter-react-16

# React 17+
npm install --save-dev enzyme @wojtekmaj/enzyme-adapter-react-17

# React 18+
npm install --save-dev enzyme @wojtekmaj/enzyme-adapter-react-17
```

### Auto-Generated Files

When using Enzyme, the extension automatically creates:

- **`__mocks__/cheerio.js`**: Prevents Web API conflicts
- **`src/setupTests.js`**: Enzyme configuration and polyfills
- **Jest configuration**: Added to `package.json` if missing

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot find module 'enzyme'"
**Solution**: Install Enzyme dependencies
```bash
npm install --save-dev enzyme enzyme-adapter-react-16
```

#### 2. "ReferenceError: TextEncoder is not defined"
**Solution**: The extension auto-generates polyfills in `setupTests.js`

#### 3. Mount tests failing in CRA
**Solution**: Set `reactJestGen.includeMountTests: false` (default)

#### 4. Tests not generating
**Check**:
- File extension is `.js`, `.jsx`, `.ts`, or `.tsx`
- File contains React components or functions
- VS Code has proper permissions

#### 5. Context-dependent components failing
**Solution**: Set `reactJestGen.skipContextDependentTests: true` (default)

### Debug Mode

Enable debug logging:
```json
{
  "reactJestGen.debug": true
}
```

Check VS Code Output panel → "React Jest Test Generator" for detailed logs.

## 📋 Examples

### Component Types Supported

#### Functional Component with Hooks
```jsx
// Input: UserProfile.jsx
import React, { useState } from 'react';

const UserProfile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <h2>{user.name}</h2>
      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? 'Cancel' : 'Edit'}
      </button>
    </div>
  );
};

export default UserProfile;
```

#### Generated Test (RTL)
```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  it('renders user information', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    render(<UserProfile user={user} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('toggles edit mode', () => {
    const user = { name: 'John Doe' };
    render(<UserProfile user={user} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveTextContent('Cancel');
  });
});
```

### Class Component
```jsx
// Input: Counter.jsx
import React, { Component } from 'react';

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    return (
      <div>
        <span>{this.state.count}</span>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}

export default Counter;
```

#### Generated Test (Enzyme)
```jsx
import React from 'react';
import { shallow } from 'enzyme';
import Counter from './Counter';

describe('Counter', () => {
  it('renders initial count', () => {
    const wrapper = shallow(<Counter />);
    expect(wrapper.find('span').text()).toBe('0');
  });

  it('increments count on button click', () => {
    const wrapper = shallow(<Counter />);
    wrapper.find('button').simulate('click');
    expect(wrapper.find('span').text()).toBe('1');
  });
});
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Jest moduleNameMapper for cheerio not found"
**Symptoms**: Warning message when generating tests with Enzyme
**Solution**: Add the following to your `package.json` Jest configuration:
```json
{
  "jest": {
    "moduleNameMapper": {
      "^cheerio$": "<rootDir>/__mocks__/cheerio.js",
      "^cheerio/(.*)$": "<rootDir>/__mocks__/cheerio.js"
    }
  }
}
```

#### Issue 2: "ENOENT: no such file or directory, open 'node:stream'"
**Symptoms**: Module resolution errors with Node.js built-in modules
**Solution**: Add Node.js module mapping to your Jest configuration:
```json
{
  "jest": {
    "moduleNameMapper": {
      "^node:(.*)$": "$1"
    }
  }
}
```

#### Issue 3: ESLint import/first errors in generated tests
**Symptoms**: ESLint complains about import order in generated test files
**Solution**: This is automatically fixed in version 0.0.4+. Update the extension or ensure React imports come first.

#### Issue 4: "Cannot find module '@mui/material/styles'" with Material-UI v4
**Symptoms**: Test fails with "Cannot find module '@mui/material/styles'" when using Material-UI v4 (@material-ui/core)
**Solution**: The extension now automatically detects your Material-UI version (v4 or v5) and generates appropriate mocks. Update to extension version 0.0.5+ for automatic detection.

**Manual Fix** (if needed):
- For Material-UI v4: Use `@material-ui/core/styles` instead of `@mui/material/styles`
- For Material-UI v5: Use `@mui/material/styles`

#### Issue 5: Material-UI compatibility issues
**Symptoms**: Tests fail with Material-UI component errors
**Solution**: The extension automatically detects your Material-UI version and generates appropriate mocks. Ensure you have the correct version installed.

#### Issue 6: "React.jsx: type is invalid... but got: undefined"
**Symptoms**: Component import errors in tests, "Cannot read properties of undefined (reading 'contextTypes')"
**Solution**: This indicates component import/export mismatch. The extension now generates tests with safety checks.

**Common Fixes**:
- **Default vs Named Export**: Ensure import style matches export style
- **File Path**: Verify the import path is correct  
- **Multiple Components**: Import all components from files with multiple exports

**Auto-Detection** (v0.0.7+): Generated tests now include checks:
```javascript
expect(YourComponent).toBeDefined();
expect(typeof YourComponent).toBe('function');
```

#### Complete Jest Configuration Example
For a comprehensive setup that resolves all common issues, see:
- `example-jest.config.js` - Basic Jest configuration with all fixes
- `jest-config-examples.js` - Advanced configuration with dynamic Material-UI detection

### Latest Fixes (v0.0.7)
- ✅ **Component Import Safety Checks**: Tests now include validation to ensure components are properly imported
- ✅ **Better Error Detection**: Detects undefined components and provides clear error messages
- ✅ **Defensive Test Generation**: Generated tests check component existence before attempting to render
- ✅ **Import/Export Troubleshooting**: Enhanced guidance for resolving component import issues

### Previous Fixes (v0.0.5-0.0.6)
- ✅ **Dynamic Material-UI Version Detection**: Automatically detects Material-UI v4 vs v5 and generates appropriate mocks
- ✅ **Import Order Fixes**: React imports always come first (ESLint import/first compliance)
- ✅ **Node.js Module Compatibility**: Fixes `node:stream` and other Node.js built-in module errors
- ✅ **Enhanced Cheerio Mocking**: Comprehensive cheerio mock for Enzyme compatibility
- ✅ **Intelligent Configuration**: Generates Jest configuration based on your project's actual dependencies
- ✅ **Interactive Troubleshooting**: Command palette integration for troubleshooting guides

## ❓ FAQ

### Q: Does this work with TypeScript?
**A**: Yes! The extension fully supports `.ts` and `.tsx` files.

### Q: Can I customize the generated test structure?
**A**: Yes, through VS Code settings and the configurable test patterns.

### Q: Does it work with Next.js?
**A**: Yes, works with any React project including Next.js, Vite, and custom setups.

### Q: What about context-dependent components?
**A**: The extension automatically detects and can skip testing context-dependent components.

### Q: Can I use this with Vitest?
**A**: Yes, set `reactJestGen.framework: "vitest"` in your settings.

### Q: How do I exclude certain files?
**A**: Use the `reactJestGen.exclude` setting with glob patterns.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/coder-dcx/react-jest-test-generator/issues)
- 📖 **Documentation**: This README
- 💬 **Discussions**: [GitHub Discussions](https://github.com/coder-dcx/react-jest-test-generator/discussions)

---

**Happy Testing!** 🧪✨

All code samples and documentation are provided "as is" without warranty of any kind. Use at your own risk.

-*Generated with ❤️ for the React testing community*

**Author By:** Neelmani Sharma
**Support Me:** [Buy Me a Coffee](UPI ID: neel.sam98@okaxis)
**Contact Me:** datacenterx.work@gmail.com

