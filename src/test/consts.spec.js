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

test(
  'consts',
  flowResultTest(
    {
      // language=thrift
      'types.thrift': `
typedef string Status
typedef double Score

const Status NOT_ELIGIBLE = "not_eligible"
const string STATUS_ELIGIBLE_LITERAL = "eligible"

const Score MIN_SCORE = 3.24
const double MAX_SCORE = 4.00

struct MyStruct {
  1: required Status f_status
  2: required Score f_score
  2: optional string f_otherStatus
}
`,
      // language=JavaScript
      'index.js': `
// @flow
import type {MyStructXXX, StatusXXX, ScoreXXX} from './types';
import {NOT_ELIGIBLE, STATUS_ELIGIBLE_LITERAL, MIN_SCORE, MAX_SCORE} from './types';

function go(s : MyStructXXX): Array<string | number> {
  const values = [s.f_status];

  if (s.f_otherStatus) {
    values.push(s.f_otherStatus);
  }

  if (s.f_score >= MIN_SCORE && s.f_score < MAX_SCORE) {
    values.push(s.f_score);
  }

  return values;
}
`,
    },
    (t: Test, r: FlowResult) => {
      t.deepEqual(r.errors, []);
      t.end();
    }
  )
);
