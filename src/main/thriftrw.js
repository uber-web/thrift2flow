// @flow

import {Thrift} from 'thriftrw';
import type {Ast} from './ast-types';
// This file is a type wrapper to thriftrw

export default function(options: {|
  strict: boolean,
  allowFilesystemAccess: boolean,
  allowOptionalArguments: boolean,
  entryPoint: string
|}): {|
  asts: {[filename: string]: Ast},
  filename: string,
  idls: {[filename: string]: {||}}
|} {
  return new Thrift(options);
}
