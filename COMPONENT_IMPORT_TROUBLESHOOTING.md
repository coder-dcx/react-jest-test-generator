# Component Import/Export Issues Troubleshooting

## Error: "React.jsx: type is invalid -- expected a string... but got: undefined"

This error indicates that the component is not being imported correctly in the test file.

### Common Causes and Solutions

#### 1. **Export/Import Mismatch**

**Problem**: Component uses default export but test imports as named export (or vice versa)

**Example Problem**:
```javascript
// Component file (CustDxTreeDataV1.js)
export default function CustDxTreeDataV1() { ... }

// Test file - WRONG
import { CustDxTreeDataV1 } from './CustDxTreeDataV1';
```

**Solution**:
```javascript
// Test file - CORRECT
import CustDxTreeDataV1 from './CustDxTreeDataV1';
```

#### 2. **Multiple Components in Same File**

**Problem**: File exports multiple components but test only imports one

**Example**:
```javascript
// Component file
export function CustDxTreeDataV1() { ... }
export function CustomTreeColumn() { ... }

// Test file - Import both components
import { CustDxTreeDataV1, CustomTreeColumn } from './CustDxTreeDataV1';
```

#### 3. **Incorrect File Path**

**Problem**: Test file cannot find the component file

**Solution**: Check that the import path in the test file is correct:
```javascript
// If component is in same directory
import CustDxTreeDataV1 from './CustDxTreeDataV1';

// If component is in parent directory
import CustDxTreeDataV1 from '../CustDxTreeDataV1';
```

### Extension Improvements (v0.0.7)

The extension now generates tests with **safety checks** to detect import issues:

```javascript
describe('CustDxTreeDataV1', () => {
  it('renders without crashing', () => {
    // Check if component is properly imported
    expect(CustDxTreeDataV1).toBeDefined();
    expect(typeof CustDxTreeDataV1).toBe('function');
    
    const wrapper = shallow(<CustDxTreeDataV1 />);
    expect(wrapper.exists()).toBe(true);
  });
});
```

These checks will:
1. **Verify the component is defined** (not undefined)
2. **Check it's a function** (valid React component)
3. **Provide clear error messages** if import fails

### Manual Fix for Existing Tests

If you have existing tests with import issues, add these checks:

```javascript
// At the beginning of each test
if (typeof YourComponent !== 'function') {
  console.warn('YourComponent is not properly imported or exported');
  expect(YourComponent).toBeDefined();
  return;
}
```

### Debugging Import Issues

1. **Check the component file** - verify how it exports:
   ```javascript
   // Default export
   export default MyComponent;
   
   // Named export
   export { MyComponent };
   
   // Multiple exports
   export { Component1, Component2 };
   export default MainComponent;
   ```

2. **Match import style** in test file:
   ```javascript
   // For default export
   import MyComponent from './MyComponent';
   
   // For named export
   import { MyComponent } from './MyComponent';
   
   // For multiple exports
   import MainComponent, { Component1, Component2 } from './MyComponent';
   ```

3. **Verify file extension** - ensure the import path includes the correct extension if needed

### Prevention

When generating new tests with the React Jest Test Generator extension (v0.0.7+):
- The extension automatically detects export patterns
- Generates appropriate import statements
- Includes safety checks to catch import issues early
- Provides clear error messages for debugging

This should prevent most import-related test failures.