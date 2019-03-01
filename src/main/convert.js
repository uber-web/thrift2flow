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
import {TypeConverter} from './types';
import prettier from 'prettier';
import path from 'path';
import {id} from './identifier';
import type {Base} from 'bufrw';
import type {
  Struct,
  Field,
  Enum,
  Typedef,
  FunctionDefinition,
  Service,
  Const,
} from 'thriftrw/ast';

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
  transformName: string => string;
  withsource: boolean;
  ast: any;
  thriftAstDefinitions: Array<any>;
  identifiersTable: {[key: string]: any};

  constructor(
    thriftPath: string,
    transformName: string => string,
    withsource: boolean
  ) {
    this.thriftPath = path.resolve(thriftPath);
    this.thrift = new Thrift({...thriftOptions, entryPoint: thriftPath});
    this.ast = this.thrift.asts[this.thrift.filename];
    this.initIdentifiersTable();
    this.thriftAstDefinitions = this.ast.definitions;
    this.transformName = transformName;
    this.types = new TypeConverter(transformName, this.thriftAstDefinitions);
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

  convertDefinitionToCode = (def: any) => {
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
    `export type ${this.transformName(def.id.name)} = {\n${def.functions
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
    return `export type ${this.transformName(
      def.id.name
    )} = ${this.types.convert(def.valueType)};`;
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
    let value;
    if (def.value.type === 'ConstList') {
      value = `[${def.value.values
        .map(val => {
          if (val.type === 'Identifier') {
            return val.name;
          }
          if (typeof val.value === 'string') {
            return `'${val.value}'`;
          }
          return val.value;
        })
        .join(',')}]`;
    } else {
      value =
        typeof def.value.value === 'string'
          ? `'${def.value.value}'`
          : def.value.value;
    }
    return `export const ${def.id.name}: ${this.types.convert(
      def.fieldType
    )} = ${value};`;
  };

  generateStruct = ({id: {name}, fields}: Struct) =>
    `export type ${this.transformName(name)} = ${this.generateStructContents(
      fields
    )};`;

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

  generateUnion = ({id: {name}, fields}: Struct) =>
    `export type ${this.transformName(name)} = ${this.generateUnionContents(
      fields
    )};`;

  generateUnionContents = (fields: Object) => {
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
      generatedImports.push("import Long from 'long'");
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
      if (
        def.type === 'Enum' ||
        (def.type === 'Typedef' && def.valueType.type === 'Enum')
      ) {
        return `$Values<typeof ${identifier}>`;
      }
      if (
        def.type === 'Struct' ||
        def.type === 'Typedef' ||
        def.type === 'Union'
      ) {
        return id(identifier);
      }
    }
    throw new Error(`not implemented. def.type ${def.type}`);
  };

  isLongDefined = () => {
    for (const astNode of this.thriftAstDefinitions) {
      if (astNode.type === 'Struct') {
        for (const field of astNode.fields) {
          if (field.valueType == null || field.valueType.annotations == null) {
            continue;
          }

          if (field.valueType.annotations['js.type'] === 'Long') {
            return true;
          }
        }
      } else if (astNode.type === 'Typedef') {
        if (
          astNode.valueType == null ||
          astNode.valueType.annotations == null
        ) {
          continue;
        }

        if (astNode.valueType.annotations['js.type'] === 'Long') {
          return true;
        }
      }
    }

    return false;
  };
}
