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
  'unions',
  flowResultTest(
    {
      // language=thrift
      'types.thrift': `
typedef MyUnion UnionTypedef
typedef MyEmptyUnion EmptyUnionTypedef

union MyUnion {
  1: string name
  2: i32 size
}

union MyEmptyUnion {
}

struct MyStruct {
  1: MyUnion f_MyUnion
  2: MyEmptyUnion f_MyEmptyUnion
  3: UnionTypedef f_UnionTypedef
  4: EmptyUnionTypedef f_EmptyUnionTypedef
}
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {MyStructXXX,UnionTypedefXXX,EmptyUnionTypedefXXX} from './types';

function go(s : MyStructXXX, u: UnionTypedefXXX, eu: EmptyUnionTypedefXXX) {
  const unions : UnionTypedefXXX[] = [s.f_MyUnion];
  const emptyunions : EmptyUnionTypedefXXX[] = [s.f_MyEmptyUnion];
  const unionDefs: UnionTypedefXXX[] = [s.f_UnionTypedef];
  const emptyunionDefs: EmptyUnionTypedefXXX[] = [s.f_EmptyUnionTypedef];
  const strings: string[] = [s.f_MyUnion.name || ''];
  const numbers: number[] = [s.f_MyUnion.size || -1];
  return [unions,unions,unionDefs,emptyunionDefs,strings,numbers];
}
`,
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);
