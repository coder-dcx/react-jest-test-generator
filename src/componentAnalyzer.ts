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

      // Parse the file using Babel parser
      const ast = this.parseFile(content, filePath);

      if (!ast) {
        console.warn(`Failed to parse file: ${filePath}`);
        return { components: [], functions: [] };
      }

      // Extract all component and function information
      const result = this.extractAllComponentsAndFunctions(ast, filePath);

      console.log(`📊 Analysis result: ${result.components.length} components, ${result.functions.length} functions`);
      console.log('Components found:', result.components.map(c => `${c.name} (${c.exportType})`));
      console.log('Functions found:', result.functions.map(f => `${f.name} (${f.exportType})`));

      return result;
    } catch (error) {
      console.error('Error analyzing component file:', error);
      // Return a fallback based on filename
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
      return {
        components: [fallbackComponent],
        functions: [],
        mainExport: fallbackComponent
      };
    }
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