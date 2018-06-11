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

import test from 'tape';
import type {Test} from 'tape';

import {flowResultTest} from './util';

test(
  'enums',
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
import type {MyStructXXX,EnumTypedefXXX} from './types';

function go(s : MyStructXXX, t: EnumTypedefXXX) {
  const values : string[] = [s.f_MyEnum, s.f_EnumTypedef, t];
  return [values];
}
`
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);

test(
  'enums values',
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
import type {MyStructXXX,EnumTypedefXXX,MyEnumXXXKeys} from './types';

function go(s : MyStructXXX, t: EnumTypedefXXX, k: MyEnumXXXKeys) {
  const values : number[] = [s.f_MyEnum, s.f_EnumTypedef, t];
  const keys : MyEnumXXXKeys = 'OK';
  return [values, keys];
}
`
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    },
    'XXX',
    true
  )
);

test(
  'enums map',
  flowResultTest(
    {
      // language=thrift
      'types.thrift': `
enum MyEnum {
  OK = 1
  ERROR = 2
}
`,
      // language=JavaScript
      'index.js': `
// @flow
import {MyEnumXXXMap} from './types';

function go() {
  return [MyEnumXXXMap.OK];
}
`
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    },
    'XXX',
    true
  )
);
