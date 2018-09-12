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
/* eslint-disable handle-callback-err */

import path from 'path';
import fs from 'fs-extra';

import {exec} from 'child_process';
import type {Test} from 'tape';
import uuid from 'uuid/v4';

import {ThriftFileConverter} from '../main/convert';


export const flowResultTest = (
  files: {[string]: string},
  testFn: (Function, FlowResult) => void,
  suffix: string = 'XXX',
  withsource: boolean = true
) => (t: Test) => {
  const root = path.resolve('src/test-output/', uuid());
  fs.mkdirSync(root);
  const paths = Object.keys(files);
  paths.forEach(p => fs.writeFileSync(path.resolve(root, p), files[p]));
  paths
    .filter(p => p.endsWith('.thrift'))
    .map(p => path.resolve(root, p))
    .forEach(p =>
      fs.writeFileSync(
        p.replace(/\.thrift$/, '.js'),
        new ThriftFileConverter(p, name => name + suffix, withsource).generateFlowFile()
      )
    );
  fs.writeFileSync(
    path.resolve(root, '.flowconfig'),
    `[libs]
./typedefs`
  );
  fs.copy('./typedefs/', path.resolve(root, 'typedefs'));
  exec('flow check --json', {cwd: root}, (err, stdout, stderr) => {
    testFn(t, JSON.parse(typeof stdout === 'string' ? stdout : stdout.toString()));
    // This can be useful when debugging generated code
    // Run `npm run clean-test-output` to clean up latter
    // eslint-disable-next-line no-process-env
    if (!process.env.KEEP_TEST_OUTPUT) {
      fs.removeSync(root);
    }
  });
};
