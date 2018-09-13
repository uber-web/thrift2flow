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
import {MyEnumValueMap} from './types';
import type {MyStructXXX,EnumTypedefXXX,MyEnumXXX} from './types';

const ok: MyEnumXXX = 'OK';
const error: MyEnumXXX = 'ERROR';

const struct: MyStructXXX = {
  f_MyEnum: ok,
  f_EnumTypedef: error,
}

const okFromMap: 1 = MyEnumValueMap.OK;
const errorFromMap: 2 = MyEnumValueMap.ERROR;

const t: EnumTypedefXXX = ok;
`
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);

test('enums with errors', flowResultTest(
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
import type {MyStructXXX,EnumTypedefXXX,MyEnumXXX} from './types';

const ok: MyEnumXXX = 'NOT CORRECT';
const error: MyEnumXXX = null;

const struct: MyStructXXX = {
  f_MyEnum: 'NOT CORRECT',
  f_EnumTypedef: null,
}

const t: EnumTypedefXXX = 'NOT CORRECT';
`
    },
    (t: Test, r: FlowResult) => {
      t.equal(r.errors.length, 5);
      t.end();
    }
  )
)
;
