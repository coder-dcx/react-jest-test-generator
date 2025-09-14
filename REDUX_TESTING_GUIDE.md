# Testing Redux Connected Components

## Problem
Redux connected components wrapped with `connect()` require a Redux store context to render properly. Without proper setup, you'll encounter errors like:

```
Error: Could not find "store" in the context of "Connect(ComponentName)". 
Either wrap the root component in a <Provider>, or pass a custom React context provider to <Provider> 
and the corresponding React context consumer to Connect(ComponentName) in connect options.
```

## Solutions

### Solution 1: Mock the `connect` function (Recommended)
This approach unwraps the component for testing:

```javascript
// Mock react-redux connect to avoid store context issues
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  connect: () => (component) => component, // Return the component unwrapped for testing
}));
```

### Solution 2: Provide a Mock Store
Create a mock Redux store and wrap components with Provider:

```javascript
import { Provider } from 'react-redux';
import { createStore } from 'redux';

// Mock Redux store for testing
const mockStore = createStore(() => ({
  // Add your initial state here
}));

// In your tests
const wrapper = shallow(
  <Provider store={mockStore}>
    <YourComponent />
  </Provider>
);
```

### Solution 3: Test the Underlying Component
Import and test the unconnected component directly:

```javascript
// If you export both connected and unconnected versions
import { DataGrid } from './index'; // Unconnected component
import ConnectedDataGrid from './index'; // Connected component

// Test the unconnected component
const wrapper = shallow(<DataGrid {...mockProps} />);
```

## Best Practices

1. **Mock at the Module Level**: Place mocks outside of describe blocks for consistency
2. **Clear Mocks**: Use `jest.clearAllMocks()` in `beforeEach` to ensure clean test state
3. **Test Component Logic**: Focus on testing component behavior rather than Redux integration
4. **Separate Integration Tests**: Create separate tests for Redux store integration if needed

## Example Complete Test File

```javascript
import React from 'react';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import DataGrid from './index';

// Mock connect to unwrap components for testing
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  connect: () => (component) => component,
}));

const mockStore = createStore(() => ({}));

describe('DataGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const wrapper = shallow(
      <Provider store={mockStore}>
        <DataGrid />
      </Provider>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it('should render correctly', () => {
    const wrapper = shallow(<DataGrid />);
    expect(wrapper).toMatchSnapshot();
  });
});
```

This approach ensures your tests run successfully while still validating your component's behavior.