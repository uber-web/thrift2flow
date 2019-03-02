// @flow
/*
 * MIT License
 *
 * Copyright (c) 2017 Uber Node.js
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {Thrift} from 'thriftrw';
import {TypeConverter} from './thrift-types';
import prettier from 'prettier';
import path from 'path';
import {id} from './identifier';
import type {Base} from 'bufrw';
import type {
  Struct,
  Union,
  Exception,
  Field,
  Enum,
  Typedef,
  FunctionDefinition,
  Service,
  Const,
  ConstEntry,
  ConstMap,
  Definition,
} from './ast-types';

const thriftOptions = {
  strict: false,
  allowFilesystemAccess: true,
  allowOptionalArguments: true,
};

function includeIdentifierOfFilename(filename: string): string {
  const match = filename.match(/([^/]+).thrift$/);
  if (!match) {
    throw new Error(`Unable to determine identifier for filename ${filename}`);
  }
  return match[1];
}

export class ThriftFileConverter {
  thriftPath: string;
  thrift: Thrift;
  types: TypeConverter;
  withsource: boolean;
  ast: any;
  thriftAstDefinitions: Array<any>;
  identifiersTable: {[key: string]: Definition};

  constructor(thriftPath: string, withsource: boolean) {
    this.thriftPath = path.resolve(thriftPath);
    this.thrift = new Thrift({...thriftOptions, entryPoint: thriftPath});
    this.ast = this.thrift.asts[this.thrift.filename];
    this.initIdentifiersTable();
    this.thriftAstDefinitions = this.ast.definitions;
    this.types = new TypeConverter(
      this.thriftAstDefinitions,
      this.identifiersTable
    );
    this.withsource = withsource;
  }

  initIdentifiersTable() {
    this.identifiersTable = {};
    Object.keys(this.thrift.asts).forEach((filename: string) => {
      const includeIdentifier = includeIdentifierOfFilename(filename);
      const includePrefix =
        filename !== this.thrift.filename ? `${includeIdentifier}.` : '';
      this.thrift.asts[filename].definitions.forEach(definition => {
        this.identifiersTable[
          `${includePrefix}${definition.id.name}`
        ] = definition;
        if (definition.type === 'Enum') {
          definition.definitions.forEach(enumDefinition => {
            this.identifiersTable[
              `${includePrefix}${definition.id.name}.${enumDefinition.id.name}`
            ] = enumDefinition;
          });
        }
      });
    });
  }

  generateFlowFile: () => string = () => {
    const result = [
      '// @flow',
      this.withsource && `// Source: ${this.thriftPath}`,
      this.generateImports(),
      ...this.thriftAstDefinitions.map(this.convertDefinitionToCode),
    ]
      .filter(Boolean)
      .join('\n\n');
    return prettier.format(result, {parser: 'flow'});
  };

  convertDefinitionToCode = (def: Definition) => {
    switch (def.type) {
      case 'Struct':
      case 'Exception':
        return this.generateStruct(def);
      case 'Union':
        return this.generateUnion(def);
      case 'Enum':
        return this.generateEnum(def);
      case 'Typedef':
        return this.generateTypedef(def);
      case 'Service':
        return this.generateService(def);
      case 'Const':
        return this.generateConst(def);
      default:
        console.warn(
          `${path.basename(this.thriftPath)}: Skipping ${def.type} ${
            def.id ? def.id.name : '?'
          }`
        );
        return null;
    }
  };

  generateService = (def: Service) =>
    `export type ${def.id.name} = {\n${def.functions
      .map(this.generateFunction)
      .join(',')}};`;

  generateFunction = (fn: FunctionDefinition) =>
    `${fn.id.name}: (${
      fn.fields.length ? this.generateStructContents([...fn.fields]) : ''
    }) => ${this.types.convert(fn.returns)}`;

  generateTypedef = (def: Typedef) => {
    if (def.valueType.type === 'Identifier') {
      const otherDef = this.identifiersTable[def.valueType.name];
      if (otherDef.type === 'Enum') {
        return this.generateEnum(otherDef, def.id.name);
      }
    }
    return `export type ${def.id.name} = ${this.types.convert(def.valueType)};`;
  };

  generateEnumUnion = (def: Enum) => {
    return def.definitions.map((d, index) => `"${d.id.name}"`).join(' | ');
  };

  generateEnum = (def: Enum, otherName?: string) => {
    const values = def.definitions
      .map((d, index) => `'${d.id.name}': '${d.id.name}',`)
      .join('\n');
    return `export const ${otherName || def.id.name}: $ReadOnly<{|
  ${values}
|}>  = Object.freeze({
  ${values}
});`;
  };

  generateConst = (def: Const) => {
    let value: ?string;
    if (def.value.type === 'ConstList') {
      value = `[${def.value.values
        .map(val => {
          if (val.type === 'Identifier') {
            return this.getIdentifier(val.name, 'value');
          }
          if (val.type === 'Literal' && typeof val.value === 'string') {
            return `'${val.value}'`;
          }
          return val.value;
        })
        .join(',')}]`;
    } else {
      // There may be other const cases we're missing here.
      value =
        typeof def.value.value === 'string'
          ? `'${def.value.value}'`
          : // $FlowFixMe
            def.value.value;
      // $FlowFixMe
      if (def.fieldType.baseType === 'i64') {
        // $FlowFixMe
        value = `Buffer.from([${value}])`;
      }
    }
    if (value === undefined) {
      if (def.value.type === 'ConstMap') {
        value = this.generateConstMap(def.value);
      } else {
        throw new Error(`value is undefined for ${def.id.name}`);
      }
    }
    return `export const ${def.id.name}: ${this.types.convert(
      // $FlowFixMe `fieldType` is missing in const?
      def.fieldType
      // $FlowFixMe
    )} = ${value};`;
  };

  generateConstEntry = (entry: ConstEntry) => {
    let key;
    let value;
    if (entry.key.type === 'Literal') {
      key = `'${entry.key.value}'`;
    } else if (entry.key.type === 'Identifier') {
      key = this.getIdentifier(entry.key.name, 'value');
    } else {
      throw new Error(`Unhandled entry.key.type ${entry.key.type}`);
    }
    if (entry.value.type === 'Literal') {
      console.log('entry.value', entry.value);
      if (typeof entry.value.value === 'number') {
        value = `${entry.value.value}`;
      } else if (typeof entry.value.value === 'string') {
        value = `'${entry.value.value}'`;
      } else {
        console.error(entry.value);
        throw new Error(`Unhandled const map entry type`);
      }
    } else if (entry.value.type === 'Identifier') {
      value = this.getIdentifier(entry.value.name, 'value');
    } else if (entry.value.type === 'ConstMap') {
      value = this.generateConstMap(entry.value);
    } else {
      throw new Error(`Unhandled entry.key.type ${entry.value.type}`);
    }
    if (key === undefined || value === undefined) {
      console.log('key', key);
      console.log('value', value);
      console.log(entry);
      throw new Error(`key or value is undefined`);
    }
    const result = `[${key}]: ${value},`;
    return result;
  };

  generateConstMap = (def: ConstMap) => {
    return `{
      ${def.entries.map(entry => this.generateConstEntry(entry)).join('\n')}
    } `;
  };

  generateStruct = ({id: {name}, fields}: Struct | Exception) =>
    `export type ${name} = ${this.generateStructContents(fields)};`;

  generateStructContents = (fields: Object) =>
    `{|${Object.values(fields)
      .map((field: Base) => {
        let value =
          field.valueType.type === 'Identifier'
            ? this.getIdentifier(field.valueType.name, 'type')
            : this.types.convert(field.valueType);
        return `${field.name}${this.isOptional(field) ? '?' : ''}: ${value};`;
      })
      .join('\n')}|}`;

  generateUnion = ({id: {name}, fields}: Union) =>
    `export type ${name} = ${this.generateUnionContents(fields)};`;

  generateUnionContents = (fields: Array<Field>) => {
    if (!fields.length) {
      return '{||}';
    }
    return Object.values(fields)
      .map((f: Base) => {
        return `{|${f.name}: ${this.types.convert(f.valueType)}|}`;
      })
      .join(' | ');
  };

  isOptional = (field: Field) => field.optional;

  generateImports = () => {
    const includes = this.ast.headers.filter(f => f.type === 'Include');
    const relativePaths = includes
      .map(i => path.parse(i.id))
      .map(parsed => path.join(parsed.dir, parsed.name))
      .map(p => (p.startsWith('.') ? p : `./${p}`));
    const generatedImports = relativePaths.map((relpath, index) => {
      let baseName = path.basename(relpath);
      let hasConflictingImport = true;
      while (hasConflictingImport) {
        hasConflictingImport = relativePaths.some((rel, nextIndex) => {
          if (nextIndex > index && path.basename(rel) === baseName) {
            return true;
          }
          return false;
        });
        if (hasConflictingImport) {
          baseName = `_${baseName}`;
        }
      }
      return `import * as ${id(baseName)} from '${relpath}';`;
    });

    if (this.isLongDefined()) {
      generatedImports.push("import thrift2flow$Long from 'long'");
    }
    return generatedImports.join('\n');
  };

  getImportAbsPaths: () => Array<string> = () =>
    Object.keys(this.thrift.idls).map(p => path.resolve(p));

  getIdentifier = (identifier: string, kind: 'type' | 'value'): string => {
    // Enums in thrift are both a type and a value. For flow we need to slip
    // this up.
    const def = this.identifiersTable[identifier];
    if (!def) {
      throw new Error(`Unable to find definition for identifier ${identifier}`);
    }
    if (kind === 'type') {
      if (def.type === 'Enum') {
        return `$Values<typeof ${identifier}>`;
      } else if (
        def.type === 'Typedef' &&
        def.valueType.type === 'Identifier'
      ) {
        const valueType = this.identifiersTable[def.valueType.name];
        if (valueType.type === 'Enum') {
          return `$Values<typeof ${identifier}>`;
        }
      }
      if (
        def.type === 'Struct' ||
        def.type === 'Exception' ||
        def.type === 'Typedef' ||
        def.type === 'Union'
      ) {
        return id(identifier);
      }
    }
    if (kind === 'value') {
      // It's okay to refernce an enum definition from a value position.
      if (def.type === 'EnumDefinition') {
        return id(identifier);
      }
      // Same for other other constants.
      if (def.type === 'Const') {
        return id(identifier);
      }
    }
    console.log(def);
    throw new Error(`Unknown identifier type ${def.type} for kind ${kind}`);
  };

  isLongDefined = () => {
    const queue = this.thriftAstDefinitions.slice();
    while (queue.length) {
      const node = queue.shift();
      if (
        node.type === 'Struct' ||
        node.type === 'Exception' ||
        node.type === 'Union'
      ) {
        for (const field of node.fields) {
          queue.push(field);
        }
      } else if (
        node.valueType &&
        node.valueType.annotations &&
        node.valueType.annotations['js.type'] === 'Long'
      ) {
        return true;
      }
    }
    return false;
  };
}
