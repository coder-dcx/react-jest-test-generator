#!/usr/bin/env node

// Simple test script to verify extension functionality
const path = require('path');
const fs = require('fs');
const { ComponentAnalyzer } = require('../out/componentAnalyzer');

async function testComponentAnalysis() {
  console.log('🧪 Testing React Jest Test Generator Extension...\n');

  // Test files to analyze
  const testFiles = [
    'test-components/Button.tsx',
    'test-components/Card.jsx',
    'test-components/Counter.jsx'
  ];

  for (const testFile of testFiles) {
    const filePath = path.join(__dirname, '..', testFile);

    if (!fs.existsSync(filePath)) {
      console.log(`❌ Test file not found: ${testFile}`);
      continue;
    }

    console.log(`📁 Analyzing: ${testFile}`);

    try {
      // Create a mock VS Code URI object
      const mockUri = {
        fsPath: filePath,
        scheme: 'file',
        authority: '',
        path: filePath,
        query: '',
        fragment: '',
        with: () => mockUri,
        toString: () => `file://${filePath}`
      };

      const componentInfo = await ComponentAnalyzer.analyzeFile(mockUri);

      if (componentInfo) {
        console.log(`✅ Component: ${componentInfo.name}`);
        console.log(`   Export Type: ${componentInfo.exportType}`);
        console.log(`   Is React Component: ${componentInfo.isReactComponent}`);
        console.log(`   Props: ${componentInfo.props?.join(', ') || 'None detected'}`);
        console.log(`   Has Default Props: ${componentInfo.hasDefaultProps}`);
      } else {
        console.log(`❌ Failed to analyze component`);
      }
    } catch (error) {
      console.log(`❌ Error analyzing ${testFile}:`, error.message);
    }

    console.log('');
  }

  console.log('🎉 Test completed!');
}

testComponentAnalysis().catch(console.error);