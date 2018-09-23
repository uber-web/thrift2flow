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

import {ThriftFileConverter} from '../main/convert';
import path from 'path';
import fs from 'fs-extra';
import tmp from 'tmp';

test(
  'typedef Date',
  flowResultTest(
    {
      // language=thrift
      'types.thrift': `
typedef byte MyByte
typedef MyByte TransitiveTypedef
typedef i64 (js.type = 'Date') Timestamp

struct OtherStruct {
    1: i32 num
    2: Timestamp ts
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
import type {
    MyStructXXX,
    OtherStructXXX,
    TimestampXXX,
} from './types';

function go(s : MyStructXXX) {
  const numbers : number[] = [s.f_MyByte, s.f_TransitiveTypedef, s.f_OtherStruct.num];
  const structs : OtherStructXXX[] = [s.f_OtherStruct];
  const timestamps : TimestampXXX[] = ["string", s.f_OtherStruct.ts];

  return [numbers, structs, timestamps];
}
          `,
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);

test('typedef long in struct', (t: Test) => {
  let files = {
    // language=thrift
    'types.thrift': `
struct UserActivitiesRequest {
  10: required string userUUID
  20: optional list<string> workflowUUIDs
  30: optional i64(js.type = "Long") fromTimestampNano
  40: optional i64(js.type = "Long") toTimestampNano
}
`,
  };
  const root = tmp.dirSync().name;
  const paths = Object.keys(files);
  paths.forEach(p => fs.writeFileSync(path.resolve(root, p), files[p]));
  paths
    .filter(p => p.endsWith('.thrift'))
    .map(p => path.resolve(root, p))
    .forEach(p => {
      let output = new ThriftFileConverter(
        p,
        name => name,
        true
      ).generateFlowFile();

      let longIndex = output.indexOf('import Long');

      t.notEqual(
        longIndex,
        -1,
        'Expected long definition but did not find one'
      );
      t.end();
    });
});

test('typedef long in global scope', (t: Test) => {
  let files = {
    // language=thrift
    'types.thrift': `
typedef i64 (js.type = "Long") Points
`,
  };
  const root = tmp.dirSync().name;
  const paths = Object.keys(files);
  paths.forEach(p => fs.writeFileSync(path.resolve(root, p), files[p]));
  paths
    .filter(p => p.endsWith('.thrift'))
    .map(p => path.resolve(root, p))
    .forEach(p => {
      let output = new ThriftFileConverter(
        p,
        name => name,
        true
      ).generateFlowFile();

      let longIndex = output.indexOf('import Long');

      t.notEqual(
        longIndex,
        -1,
        'Expected long definition but did not find one'
      );
      t.end();
    });
});
