import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Dynamic imports for Babel dependencies with fallback
let parser: any = null;
let traverse: any = null;
let types: any = null;

try {
  parser = require('@babel/parser');
  const traverseModule = require('@babel/traverse');
  traverse = traverseModule.default || traverseModule;
  types = require('@babel/types');
} catch (error) {
  console.warn('Babel dependencies not available:', error);
}

export interface ComponentInfo {
  name: string;
  exportType: 'default' | 'named';
  filePath: string;
  isReactComponent: boolean;
  isFunction: boolean;
  props?: string[];
  hasDefaultProps?: boolean;
  lineNumber?: number;
}

export interface AnalysisResult {
  components: ComponentInfo[];
  functions: ComponentInfo[];
  mainExport?: ComponentInfo;
}

export class ComponentAnalyzer {
  private static readonly REACT_COMPONENT_PATTERNS = [
    /React\.(Component|PureComponent)/,
    /extends Component/,
    /extends PureComponent/,
    /React\.forwardRef/,
    /React\.memo/,
    /function.*\(.*\).*\{.*return.*[<]/,
    /const.*=.*\(.*\).*=>.*[<]/,
  ];

  /**
   * Analyzes a React component file and extracts all component and function information
   */
  static async analyzeFile(uri: vscode.Uri): Promise<AnalysisResult> {
    try {
      const filePath = uri.fsPath;
      const content = await fs.promises.readFile(filePath, 'utf-8');

      console.log(`🔍 Analyzing file: ${filePath}`);

      // Try AST parsing first
      if (parser && traverse && types) {
        try {
          const ast = this.parseFile(content, filePath);
          if (ast) {
            const result = this.extractAllComponentsAndFunctions(ast, filePath);
            if (result.components.length > 0 || result.functions.length > 0) {
              console.log(`✅ AST Analysis successful: ${result.components.length} components, ${result.functions.length} functions`);
              return result;
            }
          }
        } catch (astError) {
          console.warn('AST parsing failed, falling back to regex:', astError);
        }
      }

      // Fallback to regex-based analysis
      console.log('📝 Using fallback regex analysis...');
      const fallbackResult = this.analyzeFallback(content, filePath);
      console.log(`📊 Fallback result: ${fallbackResult.components.length} components, ${fallbackResult.functions.length} functions`);
      
      return fallbackResult;

    } catch (error) {
      console.error('Error analyzing component file:', error);
      
      // Final fallback based on filename
      const filePath = uri.fsPath;
      const fileName = path.basename(filePath, path.extname(filePath));
      const fallbackComponent: ComponentInfo = {
        name: fileName,
        exportType: 'default',
        filePath,
        isReactComponent: true,
        isFunction: false,
        props: [],
        hasDefaultProps: false
      };
      
      console.log(`🚨 Using filename fallback: ${fileName}`);
      return {
        components: [fallbackComponent],
        functions: [],
        mainExport: fallbackComponent
      };
    }
  }

  /**
   * Fallback analysis using regex patterns when AST parsing fails
   */
  private static analyzeFallback(content: string, filePath: string): AnalysisResult {
    const components: ComponentInfo[] = [];
    const functions: ComponentInfo[] = [];
    let mainExport: ComponentInfo | undefined;

    // Look for exports first
    const defaultExportMatch = content.match(/export\s+default\s+(\w+)/);
    const namedExportMatches = content.matchAll(/export\s+(?:const|function|class)\s+(\w+)/g);
    const exportListMatch = content.match(/export\s*\{\s*([^}]+)\s*\}/);
    
    // Look for Redux connect pattern
    const connectExportMatch = content.match(/export\s+default\s+connect\([^)]*\)\((\w+)\)/);
    
    // Look for other HOC patterns
    const hocPatterns = [
      /export\s+default\s+(?:withRouter|memo|forwardRef|lazy)\((\w+)\)/,
      /export\s+default\s+(\w+)\s*\([^)]*\)\s*\((\w+)\)/
    ];

    const exportedNames = new Set<string>();
    let defaultExportName: string | null = null;

    // Handle Redux connect pattern specifically
    if (connectExportMatch && connectExportMatch[1]) {
      defaultExportName = connectExportMatch[1];
      exportedNames.add(defaultExportName);
      console.log(`🔗 Detected Redux connect pattern: ${defaultExportName}`);
    }
    // Handle other HOC patterns
    else {
      for (const pattern of hocPatterns) {
        const match = content.match(pattern);
        if (match) {
          // For patterns with two groups, use the second one (the wrapped component)
          const componentName = match[2] || match[1];
          if (componentName) {
            defaultExportName = componentName;
            exportedNames.add(defaultExportName);
            console.log(`🔗 Detected HOC pattern: ${componentName}`);
            break;
          }
        }
      }
    }

    // Collect default export (if not already handled by HOC patterns)
    if (!defaultExportName && defaultExportMatch && defaultExportMatch[1]) {
      defaultExportName = defaultExportMatch[1];
      exportedNames.add(defaultExportName);
    }

    // Collect named exports
    for (const match of namedExportMatches) {
      if (match[1]) {
        exportedNames.add(match[1]);
      }
    }

    // Collect export list
    if (exportListMatch && exportListMatch[1]) {
      const exportList = exportListMatch[1].split(',').map(name => name.trim());
      exportList.forEach(name => exportedNames.add(name));
    }

    console.log('🔍 Fallback Export Analysis:');
    console.log('  - Default export:', defaultExportName);
    console.log('  - All exports:', Array.from(exportedNames));

    // Look for React components and functions
    const componentPatterns = [
      /(?:function|const)\s+(\w+)\s*(?:\([^)]*\))?\s*(?:=>)?\s*\{[^}]*(?:return\s*\(?\s*<|jsx)/i,
      /class\s+(\w+)\s+extends\s+(?:React\.)?(?:Component|PureComponent)/i,
      /const\s+(\w+)\s*=\s*(?:React\.)?(?:memo|forwardRef|lazy)/i
    ];

    // Find React components
    for (const pattern of componentPatterns) {
      const matches = content.matchAll(new RegExp(pattern.source, 'gi'));
      for (const match of matches) {
        const name = match[1];
        if (name && exportedNames.has(name)) {
          const isDefault = name === defaultExportName;
          const info: ComponentInfo = {
            name,
            exportType: isDefault ? 'default' : 'named',
            filePath,
            isReactComponent: true,
            isFunction: false,
            props: this.extractPropsFromContent(content, name),
            hasDefaultProps: false
          };
          
          components.push(info);
          if (isDefault) mainExport = info;
          console.log(`  ✅ Found component: ${name} (${info.exportType})`);
        }
      }
    }

    // If no components found but we have exports, try a more permissive approach
    if (components.length === 0 && exportedNames.size > 0) {
      // Check if any exported function contains JSX-like patterns
      for (const exportName of exportedNames) {
        const functionRegex = new RegExp(`(?:function|const)\\s+${exportName}[\\s\\S]*?(?:return[\\s\\S]*?<|jsx|React\\.createElement)`, 'i');
        if (functionRegex.test(content)) {
          const isDefault = exportName === defaultExportName;
          const info: ComponentInfo = {
            name: exportName,
            exportType: isDefault ? 'default' : 'named',
            filePath,
            isReactComponent: true,
            isFunction: false,
            props: this.extractPropsFromContent(content, exportName),
            hasDefaultProps: false
          };
          
          components.push(info);
          if (isDefault) mainExport = info;
          console.log(`  ✅ Found component (permissive): ${exportName} (${info.exportType})`);
        }
      }
    }

    // If still no components found, use filename as fallback for default export
    if (components.length === 0 && (defaultExportName || exportedNames.size === 0)) {
      const fileName = this.getFileNameFromPath(filePath);
      const name = defaultExportName || fileName;
      const info: ComponentInfo = {
        name,
        exportType: 'default',
        filePath,
        isReactComponent: true,
        isFunction: false,
        props: [],
        hasDefaultProps: false
      };
      
      components.push(info);
      mainExport = info;
      console.log(`  🔄 Using fallback component: ${name}`);
    }

    return {
      components,
      functions,
      mainExport
    };
  }

  /**
   * Extract component name from Higher-Order Component patterns
   */
  private static extractComponentFromHOC(callExpression: any): string | null {
    if (!types) return null;

    // Handle connect(mapStateToProps, mapDispatchToProps)(ComponentName)
    if (types.isCallExpression(callExpression) && 
        types.isCallExpression(callExpression.callee) &&
        types.isIdentifier(callExpression.callee.callee) &&
        callExpression.callee.callee.name === 'connect') {
      
      const argument = callExpression.arguments[0];
      if (types.isIdentifier(argument)) {
        return argument.name;
      }
    }

    // Handle other HOCs like withRouter(ComponentName), memo(ComponentName)
    if (types.isCallExpression(callExpression) && 
        types.isIdentifier(callExpression.callee)) {
      
      const hocNames = ['withRouter', 'memo', 'forwardRef', 'lazy'];
      if (hocNames.includes(callExpression.callee.name)) {
        const argument = callExpression.arguments[0];
        if (types.isIdentifier(argument)) {
          return argument.name;
        }
      }
    }

    return null;
  }

  /**
   * Extract props from content using regex
   */
  private static extractPropsFromContent(content: string, componentName: string): string[] {
    const props: string[] = [];
    
    // Look for destructured props in function parameters
    const destructureRegex = new RegExp(`(?:function|const)\\s+${componentName}\\s*\\(\\s*\\{\\s*([^}]+)\\s*\\}`, 'i');
    const destructureMatch = content.match(destructureRegex);
    
    if (destructureMatch && destructureMatch[1]) {
      const propsString = destructureMatch[1];
      const propNames = propsString.split(',').map(prop => {
        const parts = prop.trim().split(':');
        return parts[0]?.trim() || '';
      }).filter(name => name.length > 0);
      props.push(...propNames);
    }
    
    return props;
  }

  /**
   * Parses a file using Babel parser with appropriate options
   */
  private static parseFile(content: string, filePath: string): any {
    if (!parser) {
      console.warn('Babel parser not available');
      return null;
    }

    const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');

    const parserOptions: any = {
      sourceType: 'module',
      plugins: [
        'jsx' as const,
        ...(isTypeScript ? [
          'typescript' as const,
          'decorators-legacy' as const
        ] : []),
        'classProperties' as const,
        'objectRestSpread' as const,
        'optionalChaining' as const,
        'nullishCoalescingOperator' as const,
      ],
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
    };

    try {
      return parser.parse(content, parserOptions);
    } catch (error) {
      console.error('Failed to parse file:', error);
      return null;
    }
  }

  /**
   * Extracts all components and functions from the AST
   */
  private static extractAllComponentsAndFunctions(ast: any, filePath: string): AnalysisResult {
    if (!traverse || !types) {
      console.warn('Babel traverse or types not available');
      return { components: [], functions: [] };
    }

    const components: ComponentInfo[] = [];
    const functions: ComponentInfo[] = [];
    let mainExport: ComponentInfo | undefined;

    // Track exports explicitly
    const exportedNames = new Set<string>();
    const defaultExportName = new Set<string>();

    // First pass: Find all exports
    traverse(ast, {
      ExportDefaultDeclaration: (path: any) => {
        const { declaration } = path.node;
        
        if (types.isIdentifier(declaration)) {
          // export default ComponentName
          defaultExportName.add(declaration.name);
          exportedNames.add(declaration.name);
        } else if (types.isFunctionDeclaration(declaration) && declaration.id) {
          // export default function ComponentName() {}
          defaultExportName.add(declaration.id.name);
          exportedNames.add(declaration.id.name);
        } else if (types.isArrowFunctionExpression(declaration) || types.isFunctionExpression(declaration)) {
          // export default () => {} (use filename)
          const fileName = this.getFileNameFromPath(filePath);
          defaultExportName.add(fileName);
          exportedNames.add(fileName);
        } else if (types.isCallExpression(declaration)) {
          // Handle HOCs like connect()(ComponentName) or withRouter(ComponentName)
          const hocComponent = this.extractComponentFromHOC(declaration);
          if (hocComponent) {
            defaultExportName.add(hocComponent);
            exportedNames.add(hocComponent);
            console.log(`🔗 Found HOC pattern in AST: ${hocComponent}`);
          }
        }
      },
      
      ExportNamedDeclaration: (path: any) => {
        const { declaration, specifiers } = path.node;
        
        if (declaration) {
          if (types.isFunctionDeclaration(declaration) && declaration.id) {
            exportedNames.add(declaration.id.name);
          } else if (types.isVariableDeclaration(declaration)) {
            for (const declarator of declaration.declarations) {
              if (types.isVariableDeclarator(declarator) && types.isIdentifier(declarator.id)) {
                exportedNames.add(declarator.id.name);
              }
            }
          }
        }
        
        if (specifiers) {
          for (const spec of specifiers) {
            if (types.isExportSpecifier(spec) && types.isIdentifier(spec.exported)) {
              exportedNames.add(spec.exported.name);
            }
          }
        }
      }
    });

    console.log('🔍 Export Analysis:');
    console.log('  - Default exports:', Array.from(defaultExportName));
    console.log('  - All exports:', Array.from(exportedNames));

    // Second pass: Find component/function definitions and match with exports
    traverse(ast, {
      FunctionDeclaration: (path: any) => {
        if (path.node.id) {
          const functionName = path.node.id.name;
          
          // Only include if it's exported
          if (exportedNames.has(functionName)) {
            const isReact = this.isReactComponentFunction(path.node);
            const exportType = defaultExportName.has(functionName) ? 'default' : 'named';
            
            const info: ComponentInfo = {
              name: functionName,
              exportType,
              filePath,
              isReactComponent: isReact,
              isFunction: !isReact,
              props: this.extractFunctionParams(path.node.params),
              hasDefaultProps: false,
              lineNumber: path.node.loc?.start.line
            };

            if (isReact) {
              components.push(info);
              if (exportType === 'default') mainExport = info;
            } else {
              functions.push(info);
            }
          }
        }
      },

      VariableDeclaration: (path: any) => {
        for (const declarator of path.node.declarations) {
          if (types.isVariableDeclarator(declarator) && types.isIdentifier(declarator.id)) {
            const varName = declarator.id.name;
            
            // Only include if it's exported
            if (exportedNames.has(varName) && declarator.init) {
              if (types.isArrowFunctionExpression(declarator.init) || types.isFunctionExpression(declarator.init)) {
                const isReact = this.containsJSX(declarator.init.body);
                const exportType = defaultExportName.has(varName) ? 'default' : 'named';
                
                const info: ComponentInfo = {
                  name: varName,
                  exportType,
                  filePath,
                  isReactComponent: isReact,
                  isFunction: !isReact,
                  props: this.extractFunctionParams(declarator.init.params),
                  hasDefaultProps: false,
                  lineNumber: declarator.loc?.start.line
                };

                if (isReact) {
                  components.push(info);
                  if (exportType === 'default') mainExport = info;
                } else {
                  functions.push(info);
                }
              }
            }
          }
        }
      }
    });

    // If no components found but we have default exports, create fallback
    if (components.length === 0 && defaultExportName.size > 0) {
      const fileName = Array.from(defaultExportName)[0] || this.getFileNameFromPath(filePath);
      const fallbackComponent: ComponentInfo = {
        name: fileName,
        exportType: 'default',
        filePath,
        isReactComponent: true,
        isFunction: false,
        props: [],
        hasDefaultProps: false
      };
      components.push(fallbackComponent);
      mainExport = fallbackComponent;
    }

    console.log('📊 Final Analysis Result:');
    console.log('  - Components:', components.map(c => `${c.name} (${c.exportType})`));
    console.log('  - Functions:', functions.map(f => `${f.name} (${f.exportType})`));
    console.log('  - Main export:', mainExport?.name);

    return {
      components,
      functions,
      mainExport
    };
  }

  /**
   * Logs component information for debugging
   */
  private static logComponentInfo(component: ComponentInfo, type: 'component' | 'function'): void {
    console.log(`  ${type}: ${component.name} (${component.exportType}) - props: [${component.props?.join(', ') || 'none'}]`);
  }

  /**
   * Checks if a function declaration is a React component
   */
  private static isReactComponentFunction(funcDecl: any): boolean {
    // Check function body for JSX
    return this.containsJSX(funcDecl.body);
  }

  /**
   * Extracts function parameters as potential props
   */
  private static extractFunctionParams(params: any): string[] {
    const extractedProps: string[] = [];

    params.forEach((param: any) => {
      if (types.isIdentifier(param)) {
        extractedProps.push(param.name);
      } else if (types.isObjectPattern(param)) {
        // Handle destructured parameters like { node, onChange, label }
        param.properties.forEach((prop: any) => {
          if (types.isObjectProperty(prop) && types.isIdentifier(prop.key)) {
            extractedProps.push(prop.key.name);
          } else if (types.isRestElement(prop) && types.isIdentifier(prop.argument)) {
            // Handle rest parameters like ...rest
            extractedProps.push(prop.argument.name);
          }
        });
      } else if (types.isRestElement(param) && types.isIdentifier(param.argument)) {
        // Handle rest parameters like ...args
        extractedProps.push(param.argument.name);
      } else if (types.isAssignmentPattern(param)) {
        // Handle default parameters like param = defaultValue
        if (types.isIdentifier(param.left)) {
          extractedProps.push(param.left.name);
        }
      }
    });

    return extractedProps;
  }

  /**
   * Extracts props from a React component expression
   */
  private static extractPropsFromExpression(): string[] {
    // This is a simplified implementation
    // In a full implementation, you'd analyze TypeScript interfaces or PropTypes
    return [];
  }

  /**
   * Checks if an expression looks like a React component
   */
  private static isReactComponentExpression(expression: any): boolean {
    try {
      if (types.isArrowFunctionExpression(expression) || types.isFunctionExpression(expression)) {
        // Check if the function body contains JSX
        return this.containsJSX(expression.body);
      } else if (types.isCallExpression(expression)) {
        // Check for React.memo, React.forwardRef, etc.
        const callee = expression.callee;
        if (types.isMemberExpression(callee) && types.isIdentifier(callee.object) && callee.object.name === 'React') {
          if (types.isIdentifier(callee.property)) {
            const method = callee.property.name;
            return ['memo', 'forwardRef', 'lazy'].includes(method);
          }
        }
      } else if (types.isClassExpression(expression)) {
        return true; // Class expressions are likely components
      }
      return false;
    } catch (error) {
      console.warn('Error checking React component expression:', error);
      return false;
    }
  }

  /**
   * Checks if a node contains JSX
   */
  private static containsJSX(node: any): boolean {
    let hasJSX = false;

    // Simple recursive check for JSX without using traverse
    const checkNode = (n: any): void => {
      if (hasJSX) return; // Early exit if already found

      if (types.isJSXElement(n) || types.isJSXFragment(n)) {
        hasJSX = true;
        return;
      }

      // Recursively check child nodes
      for (const key in n) {
        const value = (n as unknown as Record<string, unknown>)[key];
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === 'object' && 'type' in item) {
              checkNode(item as any);
              if (hasJSX) return;
            }
          }
        } else if (value && typeof value === 'object' && 'type' in value) {
          checkNode(value as any);
          if (hasJSX) return;
        }
      }
    };

    checkNode(node);
    return hasJSX;
  }

  /**
   * Checks if the file content looks like a React component
   */
  private static isReactComponent(_content: string, ast: any): boolean {
    // Check for React patterns in content
    if (this.REACT_COMPONENT_PATTERNS.some(pattern => pattern.test(_content))) {
      return true;
    }

    // Check for JSX in AST
    return this.containsJSX(ast);
  }

  /**
   * Gets the component name from file path
   */
  private static getFileNameFromPath(filePath: string): string {
    const fileName = path.basename(filePath, path.extname(filePath));
    // Convert kebab-case or snake_case to PascalCase
    return fileName
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}