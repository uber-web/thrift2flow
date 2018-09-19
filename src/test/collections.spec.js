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
  'arrays and sets',
  flowResultTest(
    {
      // language=thrift
      'types.thrift': `
typedef byte MyByte
typedef string State
typedef i32 Num

struct OtherStruct {
  1: i32 num
}

struct MyStruct {
  1: list<i32> f_numbers
  2: list<MyByte> f_MyByte
  3: list<OtherStruct> f_OtherStruct
  4: set<i32> f_numbersSet
}
const State STATE_LOADING = "LOADING"
const State STATE_COMPLETE = "COMPLETE"
const set<State> STATES = [
  STATE_LOADING,
  STATE_COMPLETE,
  "ERROR"
]
const Num ZERO = 0
const set<Num> NUMS = [
  ZERO,
  5
]
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {MyStructXXX,OtherStructXXX} from './types';

function go(s : MyStructXXX) {
  const numbers : number[] = [
      s.f_numbers[0], s.f_MyByte[0], s.f_OtherStruct[0].num, s.f_numbersSet[0]
  ];
  const structs : OtherStructXXX[] = [s.f_OtherStruct[0]];
  return [numbers, structs];
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
  'maps',
  flowResultTest(
    {
      // language=thrift
      'types.thrift': `
typedef byte MyByte

struct OtherStruct {
  1: i32 num
}

struct MyStruct {
  1: map<string,i32> f_i32
  2: map<MyByte,MyByte> f_MyByte
  3: map<string,OtherStruct> f_OtherStruct
}
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {MyStructXXX,OtherStructXXX} from './types';

function go(s : MyStructXXX) {
  const numbers : number[] = [
      s.f_i32['ok'], s.f_MyByte[18], s.f_OtherStruct['hello'].num
  ];
  const structs : OtherStructXXX[] = [s.f_OtherStruct['hello']];
  return [numbers, structs];
}
`
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);
