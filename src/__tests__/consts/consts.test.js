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

import {flowResultTest} from '../util';
import fs from 'fs';
import {ThriftFileConverter} from '../../main/convert';

test('consts', done => {
  flowResultTest(
    {
      'types.thrift': fs
        .readFileSync(`${__dirname}/types.thrift.fixture`)
        .toString(),
      'index.js': fs.readFileSync(`${__dirname}/index.js.fixture`).toString(),
    },
    result => {
      expect(result.errors).toEqual([]);
      done();
    }
  );
});

test('constant maps', () => {
  const converter = new ThriftFileConverter(
    'src/__tests__/fixtures/const-enum-values.thrift',
    name => name,
    false
  );
  const jsContent = converter.generateFlowFile();
  expect(jsContent).toMatchInlineSnapshot(`
"// @flow

export const PlaceType: $ReadOnly<{|
  A: \\"A\\",
  B: \\"B\\"
|}> = Object.freeze({
  A: \\"A\\",
  B: \\"B\\"
});

export const UUID_TO_PLACE_TYPE: { [string]: $Values<typeof PlaceType> } = {
  [\\"123\\"]: PlaceType.A,
  [\\"456\\"]: PlaceType.B
};
"
`);
});
