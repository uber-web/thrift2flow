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

import fs from 'fs';
import {flowResultTest} from '../util';

test('arrays and sets', done => {
  flowResultTest(
    {
      'types.thrift': fs
        .readFileSync(`${__dirname}/fixtures/types.thrift.fixture`)
        .toString(),
      'index.js': fs
        .readFileSync(`${__dirname}/fixtures/index.js.fixture`)
        .toString(),
    },
    r => {
      expect(r.errors.length).toBe(0);
      done();
    }
  );
});

test('maps', done => {
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
`,
    },
    (r: FlowResult) => {
      expect(r.errors.length).toBe(0);
      done();
    }
  );
});
