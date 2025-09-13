# 🚀 VS Code Marketplace Deployment Guide

This guide provides step-by-step instructions for deploying your React Jest Test Generator extension to the Visual Studio Code Marketplace.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Prepare Your Extension](#step-1-prepare-your-extension)
- [Step 2: Create Publisher Account](#step-2-create-publisher-account)
- [Step 3: Configure package.json](#step-3-configure-packagejson)
- [Step 4: Build and Package](#step-4-build-and-package)
- [Step 5: Publish to Marketplace](#step-5-publish-to-marketplace)
- [Step 6: Verify Deployment](#step-6-verify-deployment)
- [Step 7: Update Your Extension](#step-7-update-your-extension)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Automated Publishing](#automated-publishing)

## Prerequisites

### 1. Microsoft Account
- Create a Microsoft account if you don't have one
- Visit: https://account.microsoft.com

### 2. Install VS Code Extension Manager
```bash
npm install -g vsce
```

### 3. Personal Access Token (PAT)
1. Go to [Azure DevOps](https://dev.azure.com)
2. Sign in with your Microsoft account
3. Navigate to **User Settings** → **Personal Access Tokens**
4. Click **New Token**
5. Set name: `vscode-marketplace`
6. Set organization: **All accessible organizations**
7. Set scope: **Marketplace** → **Manage**
8. Set expiration: **1 year** (recommended)
9. Click **Create**
10. **Copy and save the token securely** (you won't see it again!)

## Step 1: Prepare Your Extension

### 1.1 Update package.json with Marketplace Metadata

Ensure your `package.json` contains all required fields for marketplace publishing:

```json
{
  "name": "react-jest-test-generator",
  "displayName": "React Jest Test Generator",
  "description": "Automatically generate Jest test cases for React components with support for both React Testing Library and Enzyme",
  "version": "1.0.0",
  "publisher": "your-publisher-name",
  "author": {
    "name": "Your Name"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/react-jest-test-generator"
  },
  "homepage": "https://github.com/your-username/react-jest-test-generator#readme",
  "bugs": {
    "url": "https://github.com/your-username/react-jest-test-generator/issues"
  },
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": [
    "Other",
    "Testing"
  ],
  "keywords": [
    "react",
    "jest",
    "testing",
    "test-generator",
    "enzyme",
    "react-testing-library",
    "vscode-extension"
  ],
  "galleryBanner": {
    "color": "#61dafb",
    "theme": "light"
  },
  "icon": "images/icon.png",
  "activationEvents": [
    "onCommand:reactJestGen.generateTest"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "reactJestGen.generateTest",
        "title": "Generate Test for File",
        "category": "React Jest"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "reactJestGen.generateTest",
          "when": "resourceExtname =~ /\\.(js|jsx|ts|tsx)$/",
          "group": "7_modification"
        }
      ],
      "editor/context": [
        {
          "command": "reactJestGen.generateTest",
          "when": "resourceExtname =~ /\\.(js|jsx|ts|tsx)$/",
          "group": "7_modification"
        }
      ],
      "commandPalette": [
        {
          "command": "reactJestGen.generateTest",
          "when": "resourceExtname =~ /\\.(js|jsx|ts|tsx)$/"
        }
      ]
    },
    "configuration": {
      "title": "React Jest Test Generator",
      "properties": {
        "reactJestGen.testingLibrary": {
          "type": "string",
          "default": "rtl",
          "enum": ["rtl", "enzyme"],
          "enumDescriptions": [
            "React Testing Library (recommended)",
            "Enzyme (legacy support)"
          ],
          "description": "Testing library to use for generated tests"
        },
        "reactJestGen.framework": {
          "type": "string",
          "default": "jest",
          "enum": ["jest", "vitest"],
          "description": "Test framework to use"
        },
        "reactJestGen.includeMountTests": {
          "type": "boolean",
          "default": false,
          "description": "Include mount tests (requires jsdom)"
        },
        "reactJestGen.skipContextDependentTests": {
          "type": "boolean",
          "default": true,
          "description": "Skip tests for context-dependent components"
        },
        "reactJestGen.combineTests": {
          "type": "boolean",
          "default": true,
          "description": "Combine all tests for a file into a single test file"
        },
        "reactJestGen.addSnapshot": {
          "type": "boolean",
          "default": false,
          "description": "Include snapshot tests by default"
        },
        "reactJestGen.testPathPattern": {
          "type": "string",
          "default": "${componentDir}/${componentName}.test.${testExt}",
          "description": "Test file naming pattern"
        },
        "reactJestGen.include": {
          "type": "array",
          "default": ["**/*.{js,jsx,ts,tsx}"],
          "description": "Glob patterns for files to include"
        },
        "reactJestGen.exclude": {
          "type": "array",
          "default": ["**/node_modules/**", "**/*.test.*", "**/*.spec.*"],
          "description": "Glob patterns for files to exclude"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "package": "vsce package",
    "publish": "vsce publish"
  },
  "devDependencies": {
    "@types/vscode": "^1.74.0",
    "@types/node": "16.x",
    "typescript": "^4.9.0"
  }
}
```

### 1.2 Create Extension Icon

1. Create an `images` folder in your project root
2. Add a `icon.png` file (128x128 pixels recommended)
3. Ensure the icon follows VS Code marketplace guidelines

### 1.3 Update README.md

Make sure your README.md includes:
- Clear description of the extension
- Installation instructions
- Usage examples
- Configuration options
- Troubleshooting guide

## Step 2: Create Publisher Account

1. Go to [VS Code Marketplace Publisher Portal](https://marketplace.visualstudio.com/manage)
2. Sign in with your Microsoft account
3. Click **Create Publisher**
4. Choose a unique publisher name (this will be your `publisher` field in package.json)
5. Fill in your publisher details
6. Agree to the terms and conditions
7. Click **Create**

## Step 3: Configure package.json

1. Update the `publisher` field with your publisher name:
```json
{
  "publisher": "your-publisher-name"
}
```

2. Ensure all required fields are present and accurate

## Step 4: Build and Package

### 4.1 Compile the Extension
```bash
npm run compile
```

### 4.2 Package the Extension
```bash
vsce package
```

This creates a `.vsix` file in your project root (e.g., `react-jest-test-generator-0.0.1.vsix`)

### 4.3 Test the Package Locally (Optional)
```bash
code --install-extension react-jest-test-generator-0.0.1.vsix
```

## Step 5: Publish to Marketplace

### Option 1: Using VSCE (Recommended)

1. **Login to VSCE**:
```bash
vsce login your-publisher-name
```
Follow the prompts and enter your Personal Access Token when asked.

2. **Publish the extension**:
```bash
vsce publish
```

### Option 2: Manual Upload via Web Portal

1. Go to [VS Code Marketplace Publisher Portal](https://marketplace.visualstudio.com/manage)
2. Click **New Extension** → **Visual Studio Code**
3. Upload your `.vsix` file
4. Fill in the extension details:
   - **Name**: React Jest Test Generator
   - **Description**: Detailed description of your extension
   - **Tags**: react, jest, testing, test-generator, enzyme, react-testing-library
   - **Categories**: Other, Testing
5. Add screenshots (recommended)
6. Click **Publish**

## Step 6: Verify Deployment

1. **Wait for Processing**: Marketplace processing can take 5-15 minutes
2. **Check Marketplace**: Search for your extension at https://marketplace.visualstudio.com
3. **Install and Test**: Install the extension and verify it works correctly
4. **Check Publisher Portal**: Verify the extension appears in your publisher dashboard

## Step 7: Update Your Extension

### 7.1 Increment Version
Update the version in `package.json`:
```json
{
  "version": "1.0.1"
}
```

### 7.2 Make Your Changes
Implement your updates, bug fixes, or new features.

### 7.3 Republish
```bash
npm run compile
vsce publish
```

## Troubleshooting

### Common Issues

#### 1. "Publisher not found"
**Solution**: Ensure your publisher name in `package.json` matches exactly with your marketplace publisher account.

#### 2. "Extension already exists"
**Solution**: Increment the version number in `package.json` before publishing updates.

#### 3. "Invalid manifest"
**Solution**: Ensure all required fields are present:
- `name`
- `displayName`
- `description`
- `version`
- `publisher`
- `engines.vscode`
- `main`

#### 4. Authentication Issues
**Solution**:
- Regenerate your Personal Access Token
- Ensure the token has "Marketplace" scope
- Try logging out and back in: `vsce logout` then `vsce login`

#### 5. Extension Not Appearing
**Solution**:
- Wait 5-10 minutes for marketplace indexing
- Check the publisher portal for any validation errors
- Verify the extension is not marked as "Private"

#### 6. "Command not found: vsce"
**Solution**: Install VSCE globally
```bash
npm install -g vsce
```

#### 7. Compilation Errors
**Solution**: Ensure TypeScript compilation succeeds
```bash
npm run compile
```

## Best Practices

### Version Management
- Use semantic versioning (1.0.0, 1.0.1, 1.1.0, etc.)
- Update version for every publish
- Document changes in changelog

### Testing
- Test your extension in different VS Code versions
- Test on different operating systems
- Use the extension development host for testing

### Documentation
- Keep README.md updated with latest features
- Include screenshots in marketplace listing
- Provide clear setup and usage instructions

### Security
- Never commit your Personal Access Token to version control
- Use environment variables for sensitive data
- Regularly rotate your PAT (every 6-12 months)

### Marketplace Optimization
- **High-Quality Screenshots**: Show the extension in action
- **Detailed Description**: Explain what the extension does and its benefits
- **Categories & Tags**: Choose relevant categories and add appropriate tags
- **Clear Icon**: Use a professional, recognizable icon

## Automated Publishing

### GitHub Actions Setup

Create `.github/workflows/publish.yml`:

```yaml
name: Publish Extension

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Compile extension
      run: npm run compile

    - name: Publish to Marketplace
      run: npx vsce publish -p ${{ secrets.VSCE_PAT }}
      env:
        VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

### Setup GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `VSCE_PAT`
5. Value: Your Personal Access Token
6. Click **Add secret**

### Usage
1. Create a new release on GitHub
2. The workflow will automatically publish your extension
3. Monitor the Actions tab for progress

## Additional Resources

- [VS Code Extension API Documentation](https://code.visualstudio.com/api)
- [VS Code Marketplace Publisher Portal](https://marketplace.visualstudio.com/manage)
- [VSCE Documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Azure DevOps Personal Access Tokens](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)

---

## 🎉 Congratulations!

Your extension is now published on the VS Code Marketplace! Users can discover and install it through the VS Code Extensions panel.

**Next Steps:**
1. Share your extension on social media
2. Write a blog post about its features
3. Engage with users through GitHub issues
4. Plan future updates and improvements

**Happy Publishing!** 🚀</content>
<parameter name="filePath">f:\PROJECT\react-js-test-script-generator\deployment-steps.md