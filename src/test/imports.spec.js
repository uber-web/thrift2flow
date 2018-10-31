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
  'imports in same folder',
  flowResultTest(
    {
      // language=thrift
      'other.thrift': `
        typedef i32 Thing 
      `,
      // language=thrift
      'shared.thrift': `
include "./other.thrift"

struct ThingStruct {
    1: other.Thing thing
}
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
      t.equal(r.errors.length, 0);
      t.end();
    }
  )
);

test(
  'imports with special type file names',
  flowResultTest(
    {
      // language=thrift
      'any.thrift': `
        typedef i32 Thing 
      `,
      // language=thrift
      'shared.thrift': `
include "./any.thrift"
struct MyStruct {
    1: any.Thing a
    2: map<string, any.Thing> b
    3: map<any.Thing, string> c
}
typedef any.Thing MyTypedef
const any.Thing MyConst = 10;
const set<any.Thing> MySet = [0];
union MyUnion {
  1: any.Thing a
  2: i32 b
}
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {MyStructXXX} from './shared';

function go(s : MyStructXXX) {
  const numbers : number[] = [s.a];
  return [numbers];
}
    `,
    },
    (t: Test, r: FlowResult) => {
      t.equal(r.errors.length, 0);
      t.end();
    }
  )
);

test(
  'imports in sub directory',
  flowResultTest(
    {
      // language=thrift
      'subdir/other.thrift': `
        typedef i32 Thing 
      `,
      // language=thrift
      'subdir/shared.thrift': `
include "./other.thrift"

struct ThingStruct {
    1: other.Thing thing
}
struct OtherStruct {
    1: i32 num
}
typedef i32 OtherStructTypedef
`,
      // language=thrift
      'types.thrift': `
include "./subdir/shared.thrift"

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
      t.equal(r.errors.length, 0);
      t.end();
    }
  )
);
