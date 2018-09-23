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

// TODO: test relative paths

test(
  'imports in same folder',
  flowResultTest(
    {
      // language=thrift
      'shared.thrift': `
struct OtherStruct {
    1: i32 num
}
typedef i32 OtherStructTypedef
`,
      // language=thrift
      'types.thrift': `
include "./shared.thrift"

typedef shared.OtherStruct MyOtherStruct

struct MyStruct {
  1: shared.OtherStruct f_OtherStruct
  2: MyOtherStruct f_MyOtherStruct
  3: shared.OtherStructTypedef f_OtherStructTypedef
}
`,
      // language=JavaScript
      'index.js': `
            // @flow
            import type {MyStructXXX} from './types';

            function go(s : MyStructXXX) {
              const numbers : number[] = [s.f_OtherStruct.num];
              return [numbers];
            }
          `,
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);
