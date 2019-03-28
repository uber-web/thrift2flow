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

test('primitives happy path', done => {
  flowResultTest(
    {
      'types.thrift': primitiveStruct,
      'index.js': `
// @flow
import type {Primitives} from './types';

function go(s : Primitives) {
  const numbers : number[] = [s.f_byte, s.f_i8, s.f_i16, s.f_i32, s.f_double];
  const buffers : Buffer[] = [s.f_i64, s.f_binary];

  const booleans : boolean[] = [s.f_boolean];
  const strings : string[] = [s.f_string];
  return [numbers, booleans, strings, buffers];
}
`,
    },
    r => {
      expect(r.errors).toEqual([]);
      done();
    }
  );
});

test('primitives sad path', done => {
  flowResultTest(
    {
      'types.thrift': primitiveStruct,
      'index.js': `
// @flow
import type {Primitives} from './types';

function go(s : Primitives) {
  const numbers : number[] = [s.f_boolean];
  const booleans : boolean[] = [s.f_byte];
  return [numbers, booleans];
}
`,
    },
    r => {
      expect(r.errors.length).toBe(2);
      expect(r.errors[0].level).toBe('error');
      expect(r.errors[1].level).toBe('error');
      expect(r.errors[0].message[0].line).toBe(6);
      expect(r.errors[1].message[0].line).toBe(7);
      done();
    }
  );
});

test('primitives optional', done => {
  flowResultTest(
    {
      'types.thrift': primitiveStruct,
      // language=JavaScript
      'index.js': `
// @flow
import type {Primitives} from './types';

function go(s : Primitives) {
  return [
      s.f_string.length,
      s.f_optional.length,
      s.f_default.length
  ];
}
`,
    },
    r => {
      expect(r.errors.length).toBe(4);
      expect(r.errors[0].level).toBe('error');
      expect(r.errors[1].level).toBe('error');
      expect(r.errors[0].message[0].line).toBe(8);
      expect(r.errors[2].message[0].line).toBe(9);
      done();
    }
  );
});

test('primitives exact types', done => {
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
import type {Optionals} from './types';

function go() : Optionals {
  return {f_byte: 0, notActualField: true};
}
`,
    },
    r => {
      expect(r.errors.length).toBe(1);
      expect(r.errors[0].level).toBe('error');
      expect(r.errors[0].message[0].line).toBe(6);
      done();
    }
  );
});
