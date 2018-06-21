#!/usr/bin/env node
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

/* eslint-disable no-process-exit */
// @flow

import 'source-map-support/register';

import 'babel-polyfill';
import path from 'path';
import fs from 'fs';
import yargs from 'yargs';

import commonPathPrefix from 'common-path-prefix';
import mkdirp from 'mkdirp';
import {ThriftFileConverter} from './convert';

const argv = yargs
  .usage('Usage: $0 [options] <thrift files..>')
  .option('suffix', {describe: 'appended to generated type names', default: 'Type'})
  .option('withsource', {describe: 'prepend the source path of the thrift file', default: false})
  .help('h')
  .alias('h', 'help').argv;

const thriftPaths = argv._;

if (!thriftPaths.length) {
  yargs.showHelp();
  process.exit(1);
}

const allOutput = {};

for (const thriftPath of thriftPaths) {
  const converter = new ThriftFileConverter(
    thriftPath,
    name => name + argv.suffix,
    argv.withsource
  );
  converter
    .getImportAbsPaths()
    .filter(p => thriftPaths.indexOf(p) === -1)
    .forEach(p => thriftPaths.push(p));
  allOutput[converter.thriftPath] = converter.generateFlowFile();
}

const root = commonPathPrefix(Object.keys(allOutput));

for (const thriftPath in allOutput) {
  const relativeThriftPath = path.dirname(path.relative(root, thriftPath));
  const jsFilename = path.resolve(
    'flow-output',
    relativeThriftPath,
    `${path.basename(thriftPath, '.thrift')}.js`
  );
  mkdirp(path.dirname(jsFilename), () =>
    fs.writeFile(jsFilename, allOutput[thriftPath], () => console.log(`Wrote ${jsFilename}`))
  );
}
