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
  'typedefs',
  flowResultTest(
    {
      // language=thrift
      'types.thrift': `
typedef byte MyByte
typedef MyByte TransitiveTypedef

struct OtherStruct {
    1: i32 num
}

struct MyStruct {
  1: MyByte f_MyByte
  2: TransitiveTypedef f_TransitiveTypedef
  3: OtherStruct f_OtherStruct
}
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {MyStruct,OtherStruct} from './types';

function go(s : MyStruct) {
  const numbers : number[] = [s.f_MyByte, s.f_TransitiveTypedef, s.f_OtherStruct.num];
  const structs : OtherStruct[] = [s.f_OtherStruct];
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
