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

import {Thrift} from 'thriftrw';
import {ThriftFileConverter} from '../../main/convert';

test('thriftrw parses long and Long as numbers', () => {
  const fixturePath = 'src/__tests__/fixtures/long.thrift';
  const thrift = new Thrift({
    entryPoint: fixturePath,
    allowFilesystemAccess: true,
  });
  expect(thrift.MY_STRUCT.posNum1).toEqual(1);
  expect(thrift.MY_STRUCT.posNum2).toEqual(1);
  expect(thrift.MY_STRUCT.posNum3).toEqual(1);
  // thriftrw decodes i64 constant ints by discarding the native.
  expect(thrift.MY_STRUCT.negNum1).toEqual(1);
  expect(thrift.MY_STRUCT.negNum2).toEqual(1);
  expect(thrift.MY_STRUCT.negNum3).toEqual(1);
  const converter = new ThriftFileConverter(fixturePath, false);
  expect(converter.generateFlowFile()).toMatchInlineSnapshot(`
"// @flow

import thrift2flow$Long from \\"long\\";

export type MyStruct = {|
  posNum1?: ?(number | thrift2flow$Long),
  posNum2?: ?(number | thrift2flow$Long),
  posNum3?: ?(number | Buffer),
  negNum1?: ?(number | thrift2flow$Long),
  negNum2?: ?(number | thrift2flow$Long),
  negNum3?: ?(number | Buffer)
|};

export const MY_STRUCT: $ReadOnly<MyStruct> = {
  posNum1: 1,
  posNum2: 1,
  posNum3: 1,
  negNum1: 1,
  negNum2: 1,
  negNum3: 1
};
"
`);
});

test('The `long` import is included from service definition', () => {
  const fixturePath = 'src/__tests__/fixtures/long-from-service.thrift';
  const converter = new ThriftFileConverter(fixturePath, false);
  expect(converter.generateFlowFile()).toMatchInlineSnapshot(`
"// @flow

import thrift2flow$Long from \\"long\\";

export type Validate = {
  getStatus: ({| userUUID: string |}) => boolean,
  getSummary: ({|
    userUUID: string,
    startTime: number | thrift2flow$Long,
    endTime: number | thrift2flow$Long
  |}) => string
};
"
`);
});

test('The `long` import is included from service definition on return', () => {
  const fixturePath = 'src/__tests__/fixtures/long-from-service-return.thrift';
  const converter = new ThriftFileConverter(fixturePath, false);
  expect(converter.generateFlowFile()).toMatchInlineSnapshot(`
"// @flow

import thrift2flow$Long from \\"long\\";

export type Validate = {
  getStatus: ({| userUUID: string |}) => number | thrift2flow$Long
};
"
`);
});
