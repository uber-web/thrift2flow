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

import mkdirp from 'mkdirp';
import convert from './index';

const argv = yargs
  .usage('Usage: $0 [options] <thrift files..>')
  .option('path', {
    describe: 'Path used for generated code',
  })
  .option('withsource', {
    describe: 'prepend the source path of the thrift file',
    default: false,
  })
  .help('h')
  .alias('h', 'help').argv;

const thriftPaths = argv._;

if (!thriftPaths.length) {
  yargs.showHelp();
  process.exit(1);
}

const options = {
  withSource: argv.withsource,
  commonPath: argv.path,
};

const allOutput = convert(thriftPaths, options);

for (const jsFilename in allOutput) {
  mkdirp(path.dirname(jsFilename), () =>
    fs.writeFile(jsFilename, allOutput[jsFilename], () =>
      console.log(`Wrote ${jsFilename}`)
    )
  );
}
