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

    // Track all declarations to avoid duplicates
    const processedDeclarations = new Set<string>();

    traverse(ast, {
      // Handle default exports
      ExportDefaultDeclaration: (path: any) => {
        const { declaration } = path.node;
        const lineNumber = path.node.loc?.start.line;

        if (types.isFunctionDeclaration(declaration) && declaration.id) {
          const componentName = declaration.id.name;
          if (processedDeclarations.has(componentName)) return;

          const isReact = this.isReactComponentFunction(declaration);
          const info: ComponentInfo = {
            name: componentName,
            exportType: 'default',
            filePath,
            isReactComponent: isReact,
            isFunction: !isReact,
            props: this.extractFunctionParams(declaration.params),
            hasDefaultProps: false,
            lineNumber
          };

          processedDeclarations.add(componentName);
          if (isReact) {
            components.push(info);
            this.logComponentInfo(info, 'component');
          } else {
            functions.push(info);
            this.logComponentInfo(info, 'function');
          }
          mainExport = info;
        } else if (types.isArrowFunctionExpression(declaration) || types.isFunctionExpression(declaration)) {
          const componentName = this.getFileNameFromPath(filePath);
          if (processedDeclarations.has(componentName)) return;

          const isReact = this.containsJSX(declaration.body);
          const info: ComponentInfo = {
            name: componentName,
            exportType: 'default',
            filePath,
            isReactComponent: isReact,
            isFunction: !isReact,
            props: this.extractFunctionParams((declaration as any).params || []),
            hasDefaultProps: false,
            lineNumber
          };

          processedDeclarations.add(componentName);
          if (isReact) {
            components.push(info);
          } else {
            functions.push(info);
          }
          mainExport = info;
        } else if (types.isIdentifier(declaration)) {
          const componentName = declaration.name;
          if (processedDeclarations.has(componentName)) return;

          const info: ComponentInfo = {
            name: componentName,
            exportType: 'default',
            filePath,
            isReactComponent: true, // Assume it's a component if exported as default
            isFunction: false,
            props: [],
            hasDefaultProps: false,
            lineNumber
          };

          processedDeclarations.add(componentName);
          components.push(info);
          mainExport = info;
        } else if (types.isClassDeclaration(declaration) && declaration.id) {
          const componentName = declaration.id.name;
          if (processedDeclarations.has(componentName)) return;

          const info: ComponentInfo = {
            name: componentName,
            exportType: 'default',
            filePath,
            isReactComponent: true,
            isFunction: false,
            props: [],
            hasDefaultProps: false,
            lineNumber
          };

          processedDeclarations.add(componentName);
          components.push(info);
          mainExport = info;
        }
      },

      // Handle named exports
      ExportNamedDeclaration: (path: any) => {
        const { declaration } = path.node;
        const lineNumber = path.node.loc?.start.line;

        if (types.isFunctionDeclaration(declaration) && declaration.id) {
          const functionName = declaration.id.name;
          if (processedDeclarations.has(functionName)) return;

          const isReact = this.isReactComponentFunction(declaration);
          const info: ComponentInfo = {
            name: functionName,
            exportType: 'named',
            filePath,
            isReactComponent: isReact,
            isFunction: !isReact,
            props: this.extractFunctionParams(declaration.params),
            hasDefaultProps: false,
            lineNumber
          };

          processedDeclarations.add(functionName);
          if (isReact) {
            components.push(info);
            this.logComponentInfo(info, 'component');
          } else {
            functions.push(info);
            this.logComponentInfo(info, 'function');
          }
        } else if (types.isVariableDeclaration(declaration)) {
          for (const declarator of declaration.declarations) {
            if (types.isVariableDeclarator(declarator) && types.isIdentifier(declarator.id)) {
              const varName = declarator.id.name;
              if (processedDeclarations.has(varName)) continue;

              if (declarator.init && this.isReactComponentExpression(declarator.init)) {
                const info: ComponentInfo = {
                  name: varName,
                  exportType: 'named',
                  filePath,
                  isReactComponent: true,
                  isFunction: false,
                  props: this.extractPropsFromExpression(),
                  hasDefaultProps: false,
                  lineNumber
                };

                processedDeclarations.add(varName);
                components.push(info);
              } else if (declarator.init && types.isArrowFunctionExpression(declarator.init)) {
                const isReact = this.containsJSX(declarator.init.body);
                const info: ComponentInfo = {
                  name: varName,
                  exportType: 'named',
                  filePath,
                  isReactComponent: isReact,
                  isFunction: !isReact,
                  props: this.extractFunctionParams(declarator.init.params),
                  hasDefaultProps: false,
                  lineNumber
                };

                processedDeclarations.add(varName);
                if (isReact) {
                  components.push(info);
                } else {
                  functions.push(info);
                }
              }
            }
          }
        } else if (types.isClassDeclaration(declaration) && declaration.id) {
          const className = declaration.id.name;
          if (processedDeclarations.has(className)) return;

          const info: ComponentInfo = {
            name: className,
            exportType: 'named',
            filePath,
            isReactComponent: true,
            isFunction: false,
            props: [],
            hasDefaultProps: false,
            lineNumber
          };

          processedDeclarations.add(className);
          components.push(info);
        }
      },

      // Handle function declarations that might be components
      FunctionDeclaration: (path: any) => {
        if (path.node.id) {
          const functionName = path.node.id.name;
          if (processedDeclarations.has(functionName)) return;

          const lineNumber = path.node.loc?.start.line;
          const isReact = this.isReactComponentFunction(path.node);

          // Check if this function is assigned to a variable or exported elsewhere
          const binding = path.scope.getBinding(functionName);
          const isExported = binding?.referencePaths.some((refPath: any) =>
            refPath.parent && (types.isExportDefaultDeclaration(refPath.parent) ||
                             types.isExportNamedDeclaration(refPath.parent))
          );

          if (!isExported) {
            const info: ComponentInfo = {
              name: functionName,
              exportType: 'named', // Assume named if not explicitly exported
              filePath,
              isReactComponent: isReact,
              isFunction: !isReact,
              props: this.extractFunctionParams(path.node.params),
              hasDefaultProps: false,
              lineNumber
            };

            processedDeclarations.add(functionName);
            if (isReact) {
              components.push(info);
            } else {
              functions.push(info);
            }
          }
        }
      },

      // Handle variable declarations that might be components or functions
      VariableDeclaration: (path: any) => {
        for (const declarator of path.node.declarations) {
          if (types.isVariableDeclarator(declarator) && types.isIdentifier(declarator.id)) {
            const varName = declarator.id.name;
            if (processedDeclarations.has(varName)) continue;

            const lineNumber = declarator.loc?.start.line;

            if (declarator.init) {
              // Check for arrow functions first, as they are the most common pattern
              if (types.isArrowFunctionExpression(declarator.init) || types.isFunctionExpression(declarator.init)) {
                const isReact = this.containsJSX(declarator.init.body);
                const info: ComponentInfo = {
                  name: varName,
                  exportType: 'named',
                  filePath,
                  isReactComponent: isReact,
                  isFunction: !isReact,
                  props: this.extractFunctionParams(declarator.init.params),
                  hasDefaultProps: false,
                  lineNumber
                };

                processedDeclarations.add(varName);
                if (isReact) {
                  components.push(info);
                  this.logComponentInfo(info, 'component');
                } else {
                  functions.push(info);
                  this.logComponentInfo(info, 'function');
                }
              } else if (this.isReactComponentExpression(declarator.init)) {
                const info: ComponentInfo = {
                  name: varName,
                  exportType: 'named',
                  filePath,
                  isReactComponent: true,
                  isFunction: false,
                  props: this.extractPropsFromExpression(),
                  hasDefaultProps: false,
                  lineNumber
                };

                processedDeclarations.add(varName);
                components.push(info);
                this.logComponentInfo(info, 'component');
              }
            }
          }
        }
      }
    });

    // If no components or functions found, create a fallback
    if (components.length === 0 && functions.length === 0) {
      const fileName = this.getFileNameFromPath(filePath);
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