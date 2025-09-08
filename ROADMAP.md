# React Jest Test Generator VS Code Extension - Roadmap

## Overview
This roadmap outlines the phased development of a comprehensive React Jest test case generator VS Code extension. The project is structured into 4 main phases, with clear milestones and deliverables for each phase.

## Phase 1: MVP Core (Weeks 1-4)
**Goal:** Deliver a functional test generator with basic features that provides immediate value to developers.

### Milestones:
1. **Extension Skeleton & Basic Setup** (Week 1)
   - Create VS Code extension project structure
   - Set up TypeScript configuration
   - Implement basic activation and command registration
   - Add minimal package.json with extension manifest

2. **File Analysis & Component Discovery** (Week 2)
   - Implement file scanning for .js, .jsx, .ts, .tsx files
   - Basic component name detection from exports
   - Simple AST parsing for React components
   - File type detection and validation

3. **Basic Test Generation** (Week 3)
   - Generate basic render tests using React Testing Library
   - Support for default and named exports
   - Co-located test file creation
   - Basic Jest integration detection

4. **UI Integration & Commands** (Week 4)
   - Command Palette integration
   - Editor context menu actions
   - Basic status notifications
   - Test file preview functionality

### Deliverables:
- Working extension that generates basic tests
- Command: "Generate Test for File"
- Support for .js/.jsx/.ts/.tsx files
- Co-located test placement
- Basic configuration for test framework and library

## Phase 2: Enhanced Generation (Weeks 5-8)
**Goal:** Improve test quality and developer experience with smarter generation and better UX.

### Milestones:
1. **Advanced Test Content** (Week 5)
   - Optional snapshot tests
   - Custom hooks support with renderHook
   - Basic prop inference from TypeScript
   - Event handler detection

2. **Path & Configuration Management** (Week 6)
   - Configurable test file patterns with tokens
   - Multiple placement options (__tests__, centralized)
   - Auto-folder creation
   - Overwrite protection with confirmation

3. **Developer Experience Improvements** (Week 7)
   - CodeLens integration
   - Prettier/ESLint integration
   - Undo-friendly workspace edits
   - Enhanced preview with diff view

4. **Framework Awareness** (Week 8)
   - Next.js, CRA, Vite detection
   - Tailored defaults per framework
   - Path alias resolution
   - Setup validation and quick fixes

### Deliverables:
- Smart test generation with prop samples
- Flexible file placement options
- CodeLens for quick test generation
- Framework-specific optimizations
- Comprehensive settings UI

## Phase 3: Advanced Features (Weeks 9-12)
**Goal:** Add powerful features for complex scenarios and large projects.

### Milestones:
1. **AST-Driven Analysis** (Week 9)
   - Robust TypeScript/Babel AST parsing
   - React.memo, forwardRef, lazy support
   - Advanced export handling
   - Complex component structure analysis

2. **Smart Test Content & Interactions** (Week 10)
   - Accessibility-first queries
   - User-event interactions
   - Provider wrapper configuration
   - Mocking automation

3. **Reporting & Coverage** (Week 11)
   - Test coverage reporting
   - Missing test detection
   - Batch generation capabilities
   - Export functionality (JSON/Markdown)

4. **Performance & Safety** (Week 12)
   - Incremental scanning with caching
   - Large repository optimizations
   - Virtual filesystem guards
   - Error handling and recovery

### Deliverables:
- Advanced component analysis
- Automated mocking and providers
- Coverage dashboard
- Batch operations
- Performance optimizations

## Phase 4: Polish & Integrations (Weeks 13-16)
**Goal:** Refine UX, add integrations, and prepare for production release.

### Milestones:
1. **UX Refinements** (Week 13)
   - Explorer decorators and badges
   - Multi-select support
   - Keyboard shortcuts
   - Enhanced error messages

2. **Template System** (Week 14)
   - User-editable templates
   - Multiple template variants
   - Placeholder system
   - Template management UI

3. **Advanced Integrations** (Week 15)
   - Git integration
   - Jest Test Explorer integration
   - ESLint plugin interop
   - Storybook integration

4. **Quality Assurance & Release** (Week 16)
   - Comprehensive testing
   - Performance benchmarking
   - Documentation completion
   - Marketplace publishing preparation

### Deliverables:
- Polished user experience
- Template customization
- Full integration suite
- Production-ready extension

## Minimal Configuration Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "reactJestGen.framework": {
      "type": "string",
      "enum": ["jest", "vitest"],
      "default": "jest",
      "description": "Test framework to use for generated tests"
    },
    "reactJestGen.testingLibrary": {
      "type": "string",
      "enum": ["rtl", "enzyme"],
      "default": "rtl",
      "description": "Testing library to use (enzyme is deprecated)"
    },
    "reactJestGen.testPathPattern": {
      "type": "string",
      "default": "${componentDir}/${componentName}.test.${testExt}",
      "description": "Pattern for test file paths with token replacement"
    },
    "reactJestGen.addSnapshot": {
      "type": "boolean",
      "default": false,
      "description": "Whether to include snapshot tests by default"
    },
    "reactJestGen.include": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["src/**/*.{js,jsx,ts,tsx}"],
      "description": "Glob patterns for files to include in scanning"
    },
    "reactJestGen.exclude": {
      "type": "array",
      "items": { "type": "string" },
      "default": ["**/node_modules/**", "**/dist/**", "**/.next/**"],
      "description": "Glob patterns for files to exclude from scanning"
    },
    "reactJestGen.useDataTestId": {
      "type": "string",
      "enum": ["auto", "never", "prefer"],
      "default": "auto",
      "description": "How to handle data-testid attributes in tests"
    },
    "reactJestGen.enableCodeLens": {
      "type": "boolean",
      "default": true,
      "description": "Enable CodeLens for test generation"
    },
    "reactJestGen.enableExplorerDecorations": {
      "type": "boolean",
      "default": true,
      "description": "Enable file explorer decorations for test status"
    },
    "reactJestGen.providers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "package": { "type": "string" },
          "wrapper": { "type": "string" }
        }
      },
      "default": [],
      "description": "List of provider wrappers to include in tests"
    }
  }
}
```

## Token Reference for Configuration
- `${workspaceRoot}`: Root directory of the workspace
- `${componentDir}`: Directory containing the component file
- `${componentRelDir}`: Relative path from workspace root to component directory
- `${componentName}`: Name of the component (from export or filename)
- `${ext}`: Original file extension (.js, .jsx, .ts, .tsx)
- `${testExt}`: Test file extension (.js for js/jsx, .tsx for ts/tsx)

## Success Metrics
- **Phase 1:** Extension generates valid tests for 80% of React components
- **Phase 2:** 95% test generation success rate with smart features
- **Phase 3:** Handles complex component patterns and provides coverage insights
- **Phase 4:** 4.5+ star rating on VS Code Marketplace with <5% crash rate

## Risk Mitigation
- Regular testing with diverse React project types
- Incremental feature rollout with user feedback
- Fallback mechanisms for edge cases
- Comprehensive error handling and logging

## Dependencies & Prerequisites
- Node.js 16+
- VS Code 1.70+
- TypeScript 4.5+
- Basic knowledge of React Testing Library and Jest