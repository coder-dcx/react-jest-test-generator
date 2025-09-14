const fs = require('fs');
const path = require('path');

// Import the compiled analyzer
const { ComponentAnalyzer } = require('./out/componentAnalyzer.js');

// Mock VS Code URI object
function createMockUri(filePath) {
    return {
        fsPath: filePath,
        path: filePath,
        scheme: 'file'
    };
}

async function testAnalyzer() {
    const filePath = path.join(__dirname, 'example', 'index.js');
    const uri = createMockUri(filePath);
    
    console.log('🔧 Testing ComponentAnalyzer with:', filePath);
    console.log('=====================================');
    
    try {
        const result = await ComponentAnalyzer.analyzeFile(uri);
        
        console.log('\n📊 Analysis Results:');
        console.log('Components found:', result.components.length);
        console.log('Functions found:', result.functions.length);
        console.log('Main export:', result.mainExport?.name || 'None');
        
        if (result.components.length > 0) {
            console.log('\n🎯 Component Details:');
            result.components.forEach(comp => {
                console.log(`  - ${comp.name} (${comp.exportType} export)`);
                console.log(`    Props: [${comp.props.join(', ')}]`);
                console.log(`    React Component: ${comp.isReactComponent}`);
            });
        } else {
            console.log('\n❌ No components detected');
        }
        
        if (result.mainExport) {
            console.log('\n✅ Main Export Found:', result.mainExport.name);
        } else {
            console.log('\n❌ No main export found');
        }
        
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        console.error(error.stack);
    }
}

testAnalyzer();