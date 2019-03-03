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

// @flow

import {id} from './identifier';
import type {AstNode} from './ast-types';

const primitives = {
  binary: 'Buffer',
  bool: 'boolean',
  byte: 'number',
  i8: 'number',
  i16: 'number',
  i32: 'number',
  i64: 'Buffer',
  double: 'number',
  string: 'string',
  void: 'void',
};

const i64Mappings = {
  Long: 'thrift2flow$Long',
  Date: 'string',
};

export class TypeConverter {
  thriftAstDefinitions: Array<any>;
  identifiersTable: $ReadOnly<{[key: string]: AstNode}>;

  constructor(
    thriftAstDefinitions: Array<any>,
    identifiersTable: $ReadOnly<{[key: string]: AstNode}>
  ) {
    this.thriftAstDefinitions = thriftAstDefinitions;
    this.identifiersTable = identifiersTable;
  }

  baseType(t: AstNode): string | void {
    if (t.type !== 'BaseType') {
      return undefined;
    }
    if (t.baseType === 'i64') {
      const jsType = t.annotations['js.type'];
      if (jsType !== undefined) {
        return i64Mappings[jsType];
      }
    }
    return primitives[t.baseType];
  }

  convert = (t: AstNode): string => {
    if (!t) {
      throw new Error(`Assertion failed. t is not defined.`);
    }
    let type =
      this.arrayType(t) ||
      this.mapType(t) ||
      this.enumType(t) ||
      this.baseType(t);
    if (type) {
      return type;
    }
    if (t.type === 'Identifier') {
      type = id(t.name);
    }
    if (type) {
      return type;
    }
    throw new Error(`Unhandled convertion for node ${JSON.stringify(t)}`);
  };

  enumType = (thriftValueType: AstNode): string | void => {
    if (this.isEnum(thriftValueType)) {
      // Enums are values, not types. To refer to the type,
      // we use $Values<...>.
      if (thriftValueType.type !== 'Identifier') {
        throw new Error(
          'Assertion failure. Enum reference has to be an identifier'
        );
      }
      return `$Values<typeof ${thriftValueType.name}>`;
    }
    return undefined;
  };

  arrayType = (node: AstNode) =>
    ((node.type === 'List' || node.type === 'Set') &&
      `${this.convert(node.valueType)}[]`) ||
    undefined;

  mapType(t: AstNode): string | void {
    if (t.type === 'Map') {
      const keyType = this.convert(t.keyType);
      const valueType = this.convert(t.valueType);
      return `{[${keyType}]: ${valueType}}`;
    }
    return undefined;
  }

  isEnum(def: AstNode) {
    // Enums export const, not type
    if (!def.name) {
      return undefined;
    }
    return this.identifiersTable[def.name].type === 'Enum';
  }
}
