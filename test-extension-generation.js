const { ComponentAnalyzer } = require('./out/componentAnalyzer');
const fs = require('fs');
const path = require('path');

// Mock vscode module for testing
global.vscode = {
  Uri: { file: (path) => ({ fsPath: path }) },
  window: {
    showErrorMessage: (msg) => console.error('Error:', msg),
    showInformationMessage: (msg) => console.log('Info:', msg)
  },
  workspace: {
    workspaceFolders: [{ uri: { fsPath: __dirname } }]
  }
};

// Mock the generateTestContent function from extension
function generateTestContent(componentInfo, relativePath, imports) {
  // Setup code with Redux mocking
  const setupCode = `import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  connect: () => (component) => component,
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));

${imports}`;

  let testContent = `${setupCode}

describe('${componentInfo.name}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<${componentInfo.name} />);
  });

  it('should match snapshot', () => {
    const { container } = render(<${componentInfo.name} />);
    expect(container.firstChild).toMatchSnapshot();
  });`;

  // Add props test if component has props
  if (componentInfo.props && componentInfo.props.length > 0) {
    testContent += `

  it('renders with custom props', () => {`;
    const customProps = componentInfo.props.slice(0, 2);
    const customPropsString = customProps.map((prop) => `${prop}="custom${prop}"`).join(' ');
    testContent += `
    render(<${componentInfo.name} ${customPropsString} />);
    expect(screen.getByText(/./)).toBeInTheDocument();`;
    testContent += `
  });`;
  }

  // Add React component validation test
  testContent += `

  it('should be a valid React component', () => {
    expect(typeof ${componentInfo.name}).toBe('function');
    expect(${componentInfo.name}.displayName || ${componentInfo.name}.name).toBe('${componentInfo.name}');
  });`;

  testContent += `
});
`;

  return testContent;
}

async function testExtensionGeneration() {
  const componentPath = './test-components/ReduxCounter.jsx';
  
  console.log('Testing extension test generation...');
  
  try {
    // Analyze the component
    const result = await ComponentAnalyzer.analyzeFile(vscode.Uri.file(componentPath));
    
    if (!result.mainExport) {
      throw new Error('No main export found');
    }
    
    // Generate imports
    const componentDir = path.dirname(componentPath);
    const relativePath = path.relative(componentDir, componentPath);
    const componentName = result.mainExport.name;
    const imports = `import ${componentName} from './${path.basename(componentPath, path.extname(componentPath))}';`;
    
    // Generate test content
    const testContent = generateTestContent(result.mainExport, relativePath, imports);
    
    // Write test file
    const testFilePath = componentPath.replace(/\.(jsx?|tsx?)$/, '.test.js');
    fs.writeFileSync(testFilePath, testContent);
    
    console.log(`✅ Test file generated: ${testFilePath}`);
    console.log('Test content preview:');
    console.log('=====================');
    console.log(testContent.substring(0, 500) + '...');
    
  } catch (error) {
    console.error('❌ Test generation failed:', error.message);
  }
}

testExtensionGeneration();