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

// language=thrift
const testThriftFile = `
  typedef MyEnum EnumTypedef
  
  enum MyEnum {
    OK = 1
    ERROR = 2
  }
  
  struct MyStruct {
    1: MyEnum f_MyEnum
    2: EnumTypedef f_EnumTypedef
  }
  
  service MyService {
    i32 getNumber(1: string a, 2: bool what)
    void aVoid(1: i32 a)
    void nothing()
  }
`;

test(
  'excludeservice=true excludes service',
  flowResultTest(
    {
      'types.thrift': testThriftFile,
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
`,
    },
    (t: Test, r: FlowResult) => {
      t.equal(r.errors.length, 0);
      t.end();
    },
    'XXX',
    true,
    true,
  )
);

test(
  "excludeservice=false doesn't exclude service",
  flowResultTest(
    {
      'types.thrift': testThriftFile,
      // language=JavaScript
      'index.js': `
// @flow
import {MyEnumValueMap} from './types';
import type {MyServiceXXX, MyStructXXX,EnumTypedefXXX,MyEnumXXX} from './types';

const ok: MyEnumXXX = 'OK';
const error: MyEnumXXX = 'ERROR';

const struct: MyStructXXX = {
  f_MyEnum: ok,
  f_EnumTypedef: error,
}

const okFromMap: 1 = MyEnumValueMap.OK;
const errorFromMap: 2 = MyEnumValueMap.ERROR;

const t: EnumTypedefXXX = ok;

function go(s : MyServiceXXX) {
  return s.getNumber({a: 'hello', what: true}) / 4;
}

function checkVoids(s : MyServiceXXX) {
    ensureVoid(s.aVoid);
    s.nothing();
}

function ensureVoid(f : any => void) {
    f(0);
}
`,
    },
    (t: Test, r: FlowResult) => {
      t.equal(r.errors.length, 0);
      t.end();
    },
    'XXX',
    true,
    false,
  )
);
