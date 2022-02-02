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

import {flowResultTest} from '../test-util';

jest.setTimeout(10000);

test('imports in same folder', done => {
  flowResultTest(
    {
      'other.thrift': `
        typedef i32 Thing
        typedef string Symbol
      `,
      'shared.thrift': `
include "./other.thrift"

struct ThingStruct {
    1: other.Thing thing
    1: other.Symbol symbol
}
struct OtherStruct {
    1: i32 num
}
typedef i32 OtherStructTypedef
`,
      'types.thrift': `
include "./shared.thrift"

typedef shared.OtherStruct MyOtherStruct

struct MyStruct {
  1: shared.OtherStruct f_OtherStruct
  2: MyOtherStruct f_MyOtherStruct
  3: shared.OtherStructTypedef f_OtherStructTypedef
}
`,
      'index.js': `
            // @flow
            import type { MyStruct } from './types';

            function go(s : MyStruct) {
              const numbers : number[] = [s.f_OtherStruct.num];
              return [numbers];
            }
          `,
    },
    ({errors}) => {
      expect(errors).toEqual([]);
      done();
    }
  );
});

test('imports with special type file names', done => {
  flowResultTest(
    {
      'any.thrift': `
        typedef i32 Thing
      `,
      'static.thrift': `
      union ThriftDataValue {
        1: bool unknown
        2: bool asBool
      }
      `,
      'shared.thrift': `
include "./any.thrift"
include "./static.thrift"
struct MyStruct {
    1: any.Thing a
    2: map<string, any.Thing> b
    3: map<any.Thing, string> c
    4: static.ThriftDataValue d
}
typedef any.Thing MyTypedef
const any.Thing MyConst = 10;
const set<any.Thing> MySet = [0];
union MyUnion {
  1: any.Thing a
  2: i32 b
}
`,
      'index.js': `
// @flow
import type {MyStruct} from './shared';

function go(s : MyStruct) {
  const numbers : number[] = [s.a];
  return [numbers];
}
    `,
    },
    ({errors}) => {
      expect(errors).toEqual([]);
      done();
    }
  );
});

test('imports in sub directory', done => {
  flowResultTest(
    {
      'subdir/other.thrift': `
        typedef i32 Thing
      `,
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
      'types.thrift': `
include "./subdir/shared.thrift"

typedef shared.OtherStruct MyOtherStruct

struct MyStruct {
  1: shared.OtherStruct f_OtherStruct
  2: MyOtherStruct f_MyOtherStruct
  3: shared.OtherStructTypedef f_OtherStructTypedef
}
`,
      'index.js': `
            // @flow
            import type {MyStruct} from './types';

            function go(s : MyStruct) {
              const numbers : number[] = [s.f_OtherStruct.num];
              return [numbers];
            }
          `,
    },
    ({errors}) => {
      expect(errors).toEqual([]);
      done();
    }
  );
});
