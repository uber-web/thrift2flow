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

test('thriftrw parses i64 consts as numbers', () => {
  const thrift = new Thrift({
    entryPoint: 'src/__tests__/fixtures/i64.thrift',
    allowFilesystemAccess: true,
  });
  expect(thrift.MY_VALUE_1).toEqual(1);
  expect(thrift.MY_VALUE_2).toEqual(1);
  expect(thrift.MY_VALUE_3).toEqual(1);
  expect(thrift.MY_VALUE_4).toEqual(1);
});

test('i64 const', () => {
  const converter = new ThriftFileConverter(
    `src/__tests__/fixtures/i64.thrift`,
    false
  );
  // const i64 values (and possibly typdefs), counter
  // to the docs, are not decoded as Dates and are also
  // non-negative.
  const jsContent = converter.generateFlowFile();
  expect(jsContent).toMatchInlineSnapshot(`
"// @flow

export const MY_VALUE_1: 1 = 1;

export const MY_VALUE_2: 1 = 1;

export const MY_VALUE_3: 1 = 1;

export const MY_VALUE_4: 1 = 1;

export const MY_VALUE_5: 39 = 39;
"
`);
});
