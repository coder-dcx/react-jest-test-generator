// Comprehensive Jest setup file for React 16 with Enzyme support
import React from 'react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// Configure Enzyme adapter for React 16
configure({ adapter: new Adapter() });

// TextEncoder/TextDecoder polyfills for Node.js
if (typeof global.TextEncoder === 'undefined') {
  try {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
  } catch (error) {
    // Fallback polyfill if util is not available
    global.TextEncoder = class TextEncoder {
      encode(input = '') {
        const arr = new Uint8Array(input.length);
        for (let i = 0; i < input.length; i++) {
          arr[i] = input.charCodeAt(i);
        }
        return arr;
      }
    };
    global.TextDecoder = class TextDecoder {
      decode(arr) {
        return String.fromCharCode(...arr);
      }
    };
  }
}

// Web API polyfills
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = class ReadableStream {};
}

if (typeof global.WritableStream === 'undefined') {
  global.WritableStream = class WritableStream {};
}

if (typeof global.TransformStream === 'undefined') {
  global.TransformStream = class TransformStream {};
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = function(callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function(id) {
  clearTimeout(id);
};

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: jest.fn(() => ({
    getPropertyValue: jest.fn(() => ''),
    setProperty: jest.fn(),
    removeProperty: jest.fn(),
  })),
});

// Mock document.elementFromPoint
document.elementFromPoint = jest.fn(() => null);

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock window.scroll
Object.defineProperty(window, 'scroll', {
  writable: true,
  value: jest.fn(),
});

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
});

// Mock Material-UI theme and styles (conditional based on available packages)
try {
  require('@mui/material/styles');
  jest.mock('@mui/material/styles', () => ({
    ...jest.requireActual('@mui/material/styles'),
    createTheme: jest.fn(() => ({
      palette: { primary: { main: '#000' }, secondary: { main: '#000' } },
      breakpoints: { up: jest.fn(() => '@media (min-width:0px)') }
    })),
    ThemeProvider: ({ children }) => children,
    styled: jest.fn(() => jest.fn(() => null)),
    withStyles: jest.fn(() => (Component) => Component),
    makeStyles: jest.fn(() => () => ({})),
  }));

  jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    ThemeProvider: ({ children }) => children,
    CssBaseline: () => null,
    // Add common Material-UI components as mocks
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    IconButton: ({ children, ...props }) => <button {...props}>{children}</button>,
    TextField: ({ children, ...props }) => <input {...props}>{children}</input>,
    Paper: ({ children, ...props }) => <div {...props}>{children}</div>,
    Typography: ({ children, ...props }) => <span {...props}>{children}</span>,
    Box: ({ children, ...props }) => <div {...props}>{children}</div>,
    Container: ({ children, ...props }) => <div {...props}>{children}</div>,
    Grid: ({ children, ...props }) => <div {...props}>{children}</div>,
    Accordion: ({ children, expanded, ...props }) => <div {...props}>{children}</div>,
    AccordionSummary: ({ children, expandIcon, ...props }) => (
      <div role="button" {...props}>
        {children}
        {expandIcon && <span>{expandIcon}</span>}
      </div>
    ),
    AccordionDetails: ({ children, ...props }) => <div {...props}>{children}</div>,
    Card: ({ children, ...props }) => <div {...props}>{children}</div>,
    CardContent: ({ children, ...props }) => <div {...props}>{children}</div>,
    CardHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
    Divider: ({ children, ...props }) => <hr {...props}>{children}</hr>,
    Chip: ({ children, ...props }) => <span {...props}>{children}</span>,
    Fab: ({ children, ...props }) => <button {...props}>{children}</button>,
    Tooltip: ({ children, title, ...props }) => <div {...props}>{children}</div>,
    Menu: ({ children, ...props }) => <div {...props}>{children}</div>,
    MenuItem: ({ children, ...props }) => <div {...props}>{children}</div>,
    List: ({ children, ...props }) => <ul {...props}>{children}</ul>,
    ListItem: ({ children, ...props }) => <li {...props}>{children}</li>,
    ListItemText: ({ children, ...props }) => <span {...props}>{children}</span>,
    Dialog: ({ children, open, ...props }) => open ? <div {...props}>{children}</div> : null,
    DialogTitle: ({ children, ...props }) => <div {...props}>{children}</div>,
    DialogContent: ({ children, ...props }) => <div {...props}>{children}</div>,
    DialogActions: ({ children, ...props }) => <div {...props}>{children}</div>,
    Drawer: ({ children, open, ...props }) => open ? <div {...props}>{children}</div> : null,
    AppBar: ({ children, ...props }) => <header {...props}>{children}</header>,
    Toolbar: ({ children, ...props }) => <div {...props}>{children}</div>,
    Tabs: ({ children, ...props }) => <div {...props}>{children}</div>,
    Tab: ({ children, ...props }) => <button {...props}>{children}</button>,
    FormControl: ({ children, ...props }) => <div {...props}>{children}</div>,
    FormLabel: ({ children, ...props }) => <label {...props}>{children}</label>,
    InputLabel: ({ children, ...props }) => <label {...props}>{children}</label>,
    Select: ({ children, ...props }) => <select {...props}>{children}</select>,
    FormHelperText: ({ children, ...props }) => <span {...props}>{children}</span>,
    Checkbox: ({ ...props }) => <input type="checkbox" {...props} />,
    Radio: ({ ...props }) => <input type="radio" {...props} />,
    Switch: ({ ...props }) => <input type="checkbox" {...props} />,
    Slider: ({ ...props }) => <input type="range" {...props} />,
    CircularProgress: ({ ...props }) => <div role="progressbar" {...props} />,
    LinearProgress: ({ ...props }) => <div role="progressbar" {...props} />,
    Badge: ({ children, ...props }) => <span {...props}>{children}</span>,
    Avatar: ({ children, ...props }) => <div {...props}>{children}</div>,
    Table: ({ children, ...props }) => <table {...props}>{children}</table>,
    TableHead: ({ children, ...props }) => <thead {...props}>{children}</thead>,
    TableBody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
    TableRow: ({ children, ...props }) => <tr {...props}>{children}</tr>,
    TableCell: ({ children, ...props }) => <td {...props}>{children}</td>,
  }));

  // Mock Material-UI icons (modern @mui/icons-material)
  jest.mock('@mui/icons-material', () => ({
    __esModule: true,
    default: 'MockedIcon',
    // Add common icons as mocks
    Add: 'MockedIcon',
    Edit: 'MockedIcon',
    Delete: 'MockedIcon',
    Search: 'MockedIcon',
    ExpandMore: 'MockedIcon',
    Refresh: 'MockedIcon',
    Functions: 'MockedIcon',
    Code: 'MockedIcon',
    PlayArrow: 'MockedIcon',
    ImportExport: 'MockedIcon',
    Home: 'MockedIcon',
    Settings: 'MockedIcon',
    AccountCircle: 'MockedIcon',
    Menu: 'MockedIcon',
    Close: 'MockedIcon',
    Check: 'MockedIcon',
    Error: 'MockedIcon',
    Warning: 'MockedIcon',
    Info: 'MockedIcon',
    Help: 'MockedIcon',
  }));

  // Mock Material-UI Lab components (modern @mui/lab)
  jest.mock('@mui/lab', () => ({
    ...jest.requireActual('@mui/lab'),
    Alert: ({ children, ...props }) => <div role="alert" {...props}>{children}</div>,
    Autocomplete: ({ children, options, value, onChange, label, placeholder, renderInput,
      // Filter out Material-UI specific props that shouldn't go to DOM
      InputProps, inputProps, freeSolo, selectOnFocus, clearOnBlur, handleHomeEndKeys,
      renderOption, filterOptions, getOptionLabel, onInputChange, inputValue, ...domProps }) => {
      // If renderInput is provided, use it to render the input
      if (renderInput) {
        const inputElement = renderInput({
          InputProps: InputProps || {},
          inputProps: {
            'aria-label': label,
            placeholder: placeholder,
            value: inputValue || value || '',
            ...inputProps,
          },
        });

        return (
          <div role="combobox" aria-expanded="false" {...domProps}>
            {inputElement}
            {children}
          </div>
        );
      }

      // Default simple mock with proper accessibility
      return (
        <div role="combobox" aria-label={label} {...domProps}>
          <input
            type="text"
            placeholder={placeholder}
            value={inputValue || value || ''}
            aria-label={label}
            role="textbox"
          />
          {children}
        </div>
      );
    },
    Skeleton: ({ children, ...props }) => <div role="progressbar" {...props}>{children}</div>,
    LoadingButton: ({ children, loading, ...props }) => <button disabled={loading} {...props}>{children}</button>,
    TabList: ({ children, ...props }) => <div {...props}>{children}</div>,
    TabPanel: ({ children, ...props }) => <div {...props}>{children}</div>,
  }));
} catch (error) {
  // @mui/material not available, try @material-ui/core
  try {
    require('@material-ui/core/styles');
    jest.mock('@material-ui/core/styles', () => ({
      ...jest.requireActual('@material-ui/core/styles'),
      createTheme: jest.fn(() => ({})),
      ThemeProvider: ({ children }) => children,
      withStyles: jest.fn(() => (Component) => Component),
      makeStyles: jest.fn(() => () => ({})),
    }));

    jest.mock('@material-ui/core', () => ({
      ...jest.requireActual('@material-ui/core'),
      ThemeProvider: ({ children }) => children,
      CssBaseline: () => null,
      // Add common Material-UI components as mocks
      Button: ({ children, ...props }) => <button {...props}>{children}</button>,
      IconButton: ({ children, ...props }) => <button {...props}>{children}</button>,
      TextField: ({ children, ...props }) => <input {...props}>{children}</input>,
      Paper: ({ children, ...props }) => <div {...props}>{children}</div>,
      Typography: ({ children, ...props }) => <span {...props}>{children}</span>,
      Box: ({ children, ...props }) => <div {...props}>{children}</div>,
      Container: ({ children, ...props }) => <div {...props}>{children}</div>,
      Grid: ({ children, ...props }) => <div {...props}>{children}</div>,
      Accordion: ({ children, expanded, ...props }) => <div {...props}>{children}</div>,
      AccordionSummary: ({ children, expandIcon, ...props }) => (
        <div role="button" {...props}>
          {children}
          {expandIcon && <span>{expandIcon}</span>}
        </div>
      ),
      AccordionDetails: ({ children, ...props }) => <div {...props}>{children}</div>,
      Card: ({ children, ...props }) => <div {...props}>{children}</div>,
      CardContent: ({ children, ...props }) => <div {...props}>{children}</div>,
      CardHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
      Divider: ({ children, ...props }) => <hr {...props}>{children}</hr>,
      Chip: ({ children, ...props }) => <span {...props}>{children}</span>,
    }));

    // Mock Material-UI icons
    jest.mock('@material-ui/icons', () => ({
      __esModule: true,
      default: 'MockedIcon',
      // Add common icons as mocks
      Add: 'MockedIcon',
      Edit: 'MockedIcon',
      Delete: 'MockedIcon',
      Search: 'MockedIcon',
      ExpandMore: 'MockedIcon',
      Refresh: 'MockedIcon',
      Functions: 'MockedIcon',
      Code: 'MockedIcon',
      PlayArrow: 'MockedIcon',
      ImportExport: 'MockedIcon',
    }));

    // Mock Material-UI Lab components
    jest.mock('@material-ui/lab', () => ({
      ...jest.requireActual('@material-ui/lab'),
      Alert: ({ children, ...props }) => <div role="alert" {...props}>{children}</div>,
      Autocomplete: ({ children, options, value, onChange, label, placeholder, renderInput,
        // Filter out Material-UI specific props that shouldn't go to DOM
        InputProps, inputProps, freeSolo, selectOnFocus, clearOnBlur, handleHomeEndKeys,
        renderOption, filterOptions, getOptionLabel, onInputChange, inputValue, ...domProps }) => {
        // If renderInput is provided, use it to render the input
        if (renderInput) {
          const inputElement = renderInput({
            InputProps: InputProps || {},
            inputProps: {
              'aria-label': label,
              placeholder: placeholder,
              value: inputValue || value || '',
              ...inputProps,
            },
          });

          return (
            <div role="combobox" aria-expanded="false" {...domProps}>
              {inputElement}
              {children}
            </div>
          );
        }

        // Default simple mock with proper accessibility
        return (
          <div role="combobox" aria-label={label} {...domProps}>
            <input
              type="text"
              placeholder={placeholder}
              value={inputValue || value || ''}
              aria-label={label}
              role="textbox"
            />
            {children}
          </div>
        );
      },
      Skeleton: ({ children, ...props }) => <div role="progressbar" {...props}>{children}</div>,
    }));
  } catch (error2) {
    // Neither @mui/material nor @material-ui/core available, skip Material-UI mocking
    console.log('Material-UI packages not found, skipping Material-UI mocks');
  }
}

// Conditionally mock React Router if available
try {
  require('react-router-dom');
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(() => jest.fn()),
    useLocation: jest.fn(() => ({ pathname: '/', search: '', hash: '', state: null })),
    useParams: jest.fn(() => ({})),
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
    NavLink: ({ children, ...props }) => <a {...props}>{children}</a>,
  }));
} catch (error) {
  // react-router-dom not available, skip mocking
}

// Conditionally mock Axios if available
try {
  require('axios');
  jest.mock('axios', () => ({
    __esModule: true,
    default: {
      get: jest.fn(() => Promise.resolve({ data: {} })),
      post: jest.fn(() => Promise.resolve({ data: {} })),
      put: jest.fn(() => Promise.resolve({ data: {} })),
      delete: jest.fn(() => Promise.resolve({ data: {} })),
      create: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ data: {} })),
        post: jest.fn(() => Promise.resolve({ data: {} })),
        put: jest.fn(() => Promise.resolve({ data: {} })),
        delete: jest.fn(() => Promise.resolve({ data: {} })),
      })),
    },
  }));
} catch (error) {
  // axios not available, skip mocking
}

// Mock localStorage and sessionStorage
const createMockStorage = () => ({
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(() => null),
  length: 0,
});

Object.defineProperty(window, 'localStorage', {
  value: createMockStorage(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: createMockStorage(),
});

// Suppress specific React warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: React does not recognize the') ||
     args[0].includes('Warning: Unknown event handler property') ||
     args[0].includes('Warning: Received `true` for a non-boolean attribute') ||
     args[0].includes('Warning: <MockedIcon /> is using incorrect casing') ||
     args[0].includes('Warning: The tag <MockedIcon> is unrecognized in this browser') ||
     args[0].includes('Warning: Invalid value for prop') ||
     args[0].includes('Warning: Failed prop type') ||
     args[0].includes('Warning: Each child in a list should have a unique "key" prop') ||
     args[0].includes('Warning: Cannot update during an existing state transition') ||
     args[0].includes('Warning: An update to') ||
     args[0].includes('inside a test was not wrapped in act(...)') ||
     args[0].includes('MockedIcon') ||
     args[0].includes('incorrect casing') ||
     args[0].includes('unrecognized in this browser') ||
     args[0].includes('Invalid DOM property') ||
     args[0].includes('is using uppercase HTML') ||
     args[0].includes('Expected server HTML to contain a matching'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Suppress specific React warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') ||
     args[0].includes('was not wrapped in act') ||
     args[0].includes('Cannot update during an existing state transition') ||
     args[0].includes('An update to') ||
     args[0].includes('inside a test was not wrapped in act(...)'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};