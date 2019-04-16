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

test('thriftrw parses enum i32 const array as strings', () => {
  const thrift = new Thrift({
    entryPoint: 'src/__tests__/fixtures/const-list.thrift',
    allowFilesystemAccess: true,
  });
  expect(thrift.DIRECTIONS).toEqual(['LEFT', 'RIGHT', 'LEFT', 'RIGHT']);
});

test('const map values are numbers', () => {
  const converter = new ThriftFileConverter(
    `src/__tests__/fixtures/const-list.thrift`,
    false
  );
  const jsContent = converter.generateFlowFile();
  expect(jsContent).toMatchInlineSnapshot(`
"// @flow

export const Direction: $ReadOnly<{|
  LEFT: \\"LEFT\\",
  RIGHT: \\"RIGHT\\"
|}> = Object.freeze({
  LEFT: \\"LEFT\\",
  RIGHT: \\"RIGHT\\"
});

export const DIRECTIONS: $Values<typeof Direction>[] = [
  Direction.LEFT,
  Direction.RIGHT,
  Direction.LEFT,
  Direction.RIGHT
];

export const DIRECTIONS_LIST: $Values<typeof Direction>[] = [
  Direction.LEFT,
  Direction.RIGHT,
  Direction.LEFT,
  Direction.RIGHT
];
"
`);
});
