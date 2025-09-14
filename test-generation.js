const fs = require('fs');
const path = require('path');

// Import the compiled modules
const { ComponentAnalyzer } = require('./out/componentAnalyzer.js');

// Mock VS Code URI object
function createMockUri(filePath) {
    return {
        fsPath: filePath,
        path: filePath,
        scheme: 'file'
    };
}

// Mock VS Code workspace to simulate extension behavior
const mockWorkspace = {
    getConfiguration: () => ({
        get: (key) => {
            const config = {
                'testFileNaming': 'component.test.js',
                'importStyle': 'enzyme',
                'testingLibrary': 'enzyme'
            };
            return config[key];
        }
    })
};

// Simulate the test generation function from extension.ts
async function generateTestFile(componentUri) {
    try {
        // Analyze the component
        const result = await ComponentAnalyzer.analyzeFile(componentUri);
        
        if (result.components.length === 0) {
            console.error('❌ No components found!');
            return;
        }

        const component = result.mainExport || result.components[0];
        console.log(`🎯 Generating test for: ${component.name}`);

        // Generate basic test content
        const componentName = component.name;
        const filePath = componentUri.fsPath;
        const fileName = path.basename(filePath, path.extname(filePath));
        const relativePath = `./${fileName}`;

        // Generate import statement based on export type
        const importStatement = component.exportType === 'default' 
            ? `import ${componentName} from '${relativePath}';`
            : `import { ${componentName} } from '${relativePath}';`;

        // Generate basic props if none detected
        const props = component.props && component.props.length > 0 
            ? component.props 
            : ['columns', 'initialRows', 'rowIdOptions', 'cellOptions', 'onRowChange']; // Default for DataGrid

        const propsObject = props.map(prop => {
            if (prop === 'columns') return 'columns: []';
            if (prop === 'initialRows') return 'initialRows: []';
            if (prop === 'rowIdOptions') return 'rowIdOptions: []';
            if (prop === 'cellOptions') return 'cellOptions: []';
            if (prop === 'onRowChange') return 'onRowChange: jest.fn()';
            return `${prop}: 'test-${prop}'`;
        }).join(',\n    ');

        const testContent = `import React from 'react';
import { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';
${importStatement}

// Configure Enzyme adapter
configure({ adapter: new Adapter() });

describe('${componentName}', () => {
  const defaultProps = {
    ${propsObject}
  };

  it('should render without crashing', () => {
    const wrapper = shallow(<${componentName} {...defaultProps} />);
    expect(wrapper).toBeTruthy();
  });

  it('should render correctly', () => {
    const wrapper = shallow(<${componentName} {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should mount without errors', () => {
    const wrapper = mount(<${componentName} {...defaultProps} />);
    expect(wrapper.find('${componentName}')).toHaveLength(1);
    wrapper.unmount();
  });
});
`;

        console.log('\n📝 Generated Test Content:');
        console.log('=====================================');
        console.log(testContent);
        
        // Write the test file
        const testFilePath = path.join(path.dirname(filePath), `${fileName}.test.js`);
        fs.writeFileSync(testFilePath, testContent);
        console.log(`\n✅ Test file generated: ${testFilePath}`);

    } catch (error) {
        console.error('❌ Test generation failed:', error.message);
        console.error(error.stack);
    }
}

// Test with index.js
async function testGeneration() {
    const filePath = path.join(__dirname, 'example', 'index.js');
    const uri = createMockUri(filePath);
    
    console.log('🧪 Testing test generation for:', filePath);
    console.log('=========================================');
    
    await generateTestFile(uri);
}

testGeneration();