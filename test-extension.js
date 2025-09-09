#!/usr/bin/env node

// Simple test script to verify extension functionality
const path = require('path');
const fs = require('fs');
const { ComponentAnalyzer } = require('./out/componentAnalyzer');

async function testComponentAnalysis() {
  console.log('🧪 Testing React Jest Test Generator Extension...\n');

  // Test files to analyze
  const testFiles = [
    './test-components/Button.tsx',
    './test-components/Card.jsx',
    './test-components/Counter.jsx'
  ];

  for (const testFile of testFiles) {
    const filePath = path.join(__dirname, testFile);

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

      const analysisResult = await ComponentAnalyzer.analyzeFile(mockUri);

      if (analysisResult && (analysisResult.components.length > 0 || analysisResult.functions.length > 0)) {
        console.log(`✅ Found ${analysisResult.components.length} components and ${analysisResult.functions.length} functions`);

        analysisResult.components.forEach((component, index) => {
          console.log(`   Component ${index + 1}: ${component.name}`);
          console.log(`     Export Type: ${component.exportType}`);
          console.log(`     Is React Component: ${component.isReactComponent}`);
          console.log(`     Props: ${component.props?.join(', ') || 'None detected'}`);
          console.log(`     Has Default Props: ${component.hasDefaultProps}`);
        });

        analysisResult.functions.forEach((func, index) => {
          console.log(`   Function ${index + 1}: ${func.name}`);
          console.log(`     Export Type: ${func.exportType}`);
          console.log(`     Props: ${func.props?.join(', ') || 'None detected'}`);
        });
      } else {
        console.log(`❌ No components or functions found`);
      }
    } catch (error) {
      console.log(`❌ Error analyzing ${testFile}:`, error.message);
    }

    console.log('');
  }

  console.log('🎉 Test completed!');
}

testComponentAnalysis().catch(console.error);