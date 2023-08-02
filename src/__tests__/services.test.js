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
import {ThriftFileConverter} from '../main/convert';

jest.setTimeout(10000);

test('services happy path', done => {
  flowResultTest(
    {
      'types.thrift': `
  service MyService {
   i32 getNumber(1: string a, 2: bool what)
   void aVoid(1: i32 a)
   void nothing()
  }
`,
      'index.js': `
// @flow
import type {MyService} from './types';

function go(s : MyService) {
  return s.getNumber({a: 'hello', what: true}) / 4;
}

function checkVoids(s : MyService) {
    ensureVoid(s.aVoid);
    s.nothing();
}

function ensureVoid(f : any => void) {
    f(0);
}
`,
    },
    r => {
      expect(r.errors).toEqual([]);
      done();
    }
  );
});

test('Extending a service', () => {
  const fixturePath = 'src/__tests__/fixtures/extending-service.thrift';
  const converter = new ThriftFileConverter(fixturePath, false);
  expect(converter.generateFlowFile()).toMatchInlineSnapshot(`
    "// @flow

    import * as service from './service';

    export type ExtendingService = service.RealService;

    export type ExtendingServiceWithMethods = {
      getNumberTwo: ({|
        a: string,
        what: boolean,
      |}) => number,
      ...service.RealService,
    };
    "
  `);
});
