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

// import {flowResultTest} from '../test-util';
import {ThriftFileConverter} from '../main/convert';
import {Thrift} from 'thriftrw';

test('Se how thriftrw decodes js.type i64', () => {
  const fixturePath = 'src/__tests__/fixtures/buffer.thrift';
  const thrift = new Thrift({
    entryPoint: fixturePath,
    allowFilesystemAccess: true,
  });
  // thriftrw seems to decode Buffer types as number.
  expect(thrift.MY_BUFF).toEqual(10);
  const converter = new ThriftFileConverter(fixturePath, false);
  expect(converter.generateFlowFile()).toMatchInlineSnapshot(`
"// @flow

export const MY_BUFF: 10 = 10;
"
`);
});
