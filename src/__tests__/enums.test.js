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

import {flowResultTest} from './util';
import {ThriftFileConverter} from '../main/convert';
import {Thrift} from 'thriftrw';

test('thriftrw enums are strings not numbers', () => {
  const thrift = new Thrift({
    entryPoint: 'src/__tests__/fixtures/my-enum.thrift',
    allowFilesystemAccess: true,
  });
  expect(thrift.MyEnum.OK).toEqual('OK');
  expect(thrift.MyEnum.ERROR).toEqual('ERROR');
});

test('enum to JS', () => {
  const converter = new ThriftFileConverter(
    'src/__tests__/fixtures/my-enum.thrift',
    name => name,
    false
  );
  const jsContent = converter.generateFlowFile();
  expect(jsContent).toMatchSnapshot();
});

test('enums work with typedefs', () => {
  const converter = new ThriftFileConverter(
    'src/__tests__/fixtures/my-enum-with-typedef.thrift',
    name => name,
    false
  );
  const jsContent = converter.generateFlowFile();
  expect(jsContent).toMatchSnapshot();
});

test('typedefs of enums can be referenced from structs', () => {
  const converter = new ThriftFileConverter(
    `src/__tests__/fixtures/enum-typedef-struct.thrift`,
    name => name,
    false
  );
  expect(converter.generateFlowFile()).toMatchInlineSnapshot(`
"// @flow

export const EnumTypedef: $ReadOnly<{|
  OK: \\"OK\\",
  ERROR: \\"ERROR\\"
|}> = Object.freeze({
  OK: \\"OK\\",
  ERROR: \\"ERROR\\"
});

export const MyEnum: $ReadOnly<{|
  OK: \\"OK\\",
  ERROR: \\"ERROR\\"
|}> = Object.freeze({
  OK: \\"OK\\",
  ERROR: \\"ERROR\\"
});

export type MyStruct = {|
  f_MyEnum: $Values<typeof MyEnum>,
  f_EnumTypedef: $Values<typeof EnumTypedef>
|};
"
`);
});

test('enums with typedefs', done => {
  flowResultTest(
    {
      'types.thrift': `
typedef MyEnum EnumTypedef

enum MyEnum {
  OK = 1
  ERROR = 2
}

struct MyStruct {
  1: MyEnum f_MyEnum
  2: EnumTypedef f_EnumTypedef
}
`,
      'index.js': `
// @flow
import { MyEnum, type MyStruct, EnumTypedef } from './types';

const ok: $Values<typeof MyEnum> = 'OK';
const error: $Values<typeof MyEnum> = 'ERROR';

const struct: MyStruct = {
  f_MyEnum: ok,
  f_EnumTypedef: error,
}

const okFromMap: 'OK' = MyEnum.OK;
const errorFromMap: 'ERROR' = MyEnum.ERROR;

const t: $Values<typeof EnumTypedef> = ok;
`,
    },
    (r: FlowResult) => {
      expect(r.errors).toEqual([]);
      done();
    }
  );
});

test('enums with errors', done => {
  flowResultTest(
    {
      // language=thrift
      'types.thrift': `
typedef MyEnum EnumTypedef

enum MyEnum {
  OK = 1
  ERROR = 2
}

struct MyStruct {
  1: MyEnum f_MyEnum
  2: EnumTypedef f_EnumTypedef
}
`,
      // language=JavaScript
      'index.js': `
// @flow
import {type MyStruct, EnumTypedef, MyEnum} from './types';

const ok: $Values<typeof MyEnum> = 'NOT CORRECT';
const error: $Values<typeof MyEnum> = null;

const struct: MyStruct = {
  f_MyEnum: 'NOT CORRECT',
  f_EnumTypedef: null,
}

const t: $Values<typeof EnumTypedef> = 'NOT CORRECT';
`,
    },
    (r: FlowResult) => {
      expect(r.errors.length).toEqual(5);
      done();
    }
  );
});
