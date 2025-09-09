"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const componentAnalyzer_1 = require("./out/componentAnalyzer");
const path = __importStar(require("path"));
// Mock vscode.Uri for testing
class MockUri {
    constructor(fsPath) {
        this.fsPath = fsPath;
    }
    static file(fsPath) {
        return new MockUri(fsPath);
    }
}
async function testAppJs() {
    try {
        const filePath = './example/App.js';
        const fullPath = path.resolve(filePath);
        const uri = MockUri.file(fullPath);
        // Mock the vscode module for this test
        global.vscode = { Uri: MockUri };
        const result = await componentAnalyzer_1.ComponentAnalyzer.analyzeFile(uri);
        console.log('Analysis result for App.js:');
        console.log('Components found:', result.components.length);
        result.components.forEach((comp, i) => {
            console.log(`  ${i + 1}. ${comp.name} (${comp.exportType}) - props: [${comp.props?.join(', ') || 'none'}]`);
        });
        console.log('Functions found:', result.functions.length);
        result.functions.forEach((func, i) => {
            console.log(`  ${i + 1}. ${func.name} (${func.exportType}) - props: [${func.props?.join(', ') || 'none'}]`);
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
}
testAppJs();
//# sourceMappingURL=test-app-analysis.js.map