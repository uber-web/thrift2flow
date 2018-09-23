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
const primitiveStruct = `
  struct Primitives {
    1: byte f_byte
    2: i8 f_i8
    3: i16 f_i16
    4: i32 f_i32
    5: i64 f_i64
    6: double f_double
    7: bool f_boolean
    8: string f_string
    9: optional string f_optional
    10: optional string f_default = "hello"
    11: binary f_binary
  }
`;

test(
  'primitives happy path',
  flowResultTest(
    {
      'types.thrift': primitiveStruct,
      // language=JavaScript
      'index.js': `
// @flow
import type {PrimitivesXXX} from './types';

function go(s : PrimitivesXXX) {
  const numbers : number[] = [s.f_byte, s.f_i8, s.f_i16, s.f_i32, s.f_double];
  const buffers : Buffer[] = [s.f_i64, s.f_binary];

  const booleans : boolean[] = [s.f_boolean];
  const strings : string[] = [s.f_string];
  return [numbers, booleans, strings, buffers];
}
`,
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);

test(
  'primitives sad path',
  flowResultTest(
    {
      'types.thrift': primitiveStruct,
      // language=JavaScript
      'index.js': `
// @flow
import type {PrimitivesXXX} from './types';

function go(s : PrimitivesXXX) {
  const numbers : number[] = [s.f_boolean];
  const booleans : boolean[] = [s.f_byte];
  return [numbers, booleans];
}
`,
    },
    (t: Test, r: FlowResult) => {
      t.equal(r.errors.length, 2);
      t.equal(r.errors[0].level, 'error');
      t.equal(r.errors[1].level, 'error');
      t.equal((r.errors[0].message[0]: any).line, 6);
      t.equal((r.errors[1].message[0]: any).line, 7);
      t.end();
    }
  )
);

test(
  'primitives optional',
  flowResultTest(
    {
      'types.thrift': primitiveStruct,
      // language=JavaScript
      'index.js': `
// @flow
import type {PrimitivesXXX} from './types';

function go(s : PrimitivesXXX) {
  return [
      s.f_string.length,
      s.f_optional.length,
      s.f_default.length
  ];
}
`,
    },
    (t: Test, r: FlowResult) => {
      t.equal(r.errors.length, 2);
      t.equal(r.errors[0].level, 'error');
      t.equal(r.errors[1].level, 'error');
      t.equal((r.errors[0].message[0]: any).line, 8);
      t.equal((r.errors[1].message[0]: any).line, 9);
      t.end();
    }
  )
);

test(
  'primitives exact types',
  flowResultTest(
    {
      'types.thrift': `
  struct Optionals {
    1: optional byte f_byte
  }
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {OptionalsXXX} from './types';

function go() : OptionalsXXX {
  return {f_byte: 0, notActualField: true};
}
`,
    },
    (t: Test, r: FlowResult) => {
      t.equal(r.errors.length, 1);
      t.equal(r.errors[0].level, 'error');
      t.equal((r.errors[0].message[0]: any).line, 6);
      t.end();
    }
  )
);
