// @flow

import {ThriftFileConverter as Converter} from './convert';
import path from 'path';
import type {Ast} from './ast-types';

type OptionsType = {|
  withSource?: boolean,
  commonPath: string,
  outputDir?: string,
|};

type Parsed = {|
  asts: {[filename: string]: Ast},
  filename: string,
  idls: {[filename: string]: {||}},
|};

export const ThriftFileConverter = Converter;

export default function convert(
  thriftPaths: Array<string>,
  options: OptionsType
) {
  const {withSource = false, outputDir = 'flow-output', commonPath} = options;
  const allOutput = {};
  for (const thriftPath of thriftPaths) {
    const converter = new ThriftFileConverter(thriftPath, withSource);
    converter
      .getImportAbsPaths()
      .filter(p => thriftPaths.indexOf(p) === -1)
      .forEach(p => thriftPaths.push(p));
    const root = commonPath;
    const relativeThriftPath = path.dirname(
      path.relative(root, converter.thriftPath)
    );
    const jsFilename = path.resolve(
      outputDir,
      relativeThriftPath,
      `${path.basename(thriftPath, '.thrift')}.js`
    );
    allOutput[jsFilename] = converter.generateFlowFile();
  }
  return allOutput;
}

export function convertParsed(thriftParsed: Parsed, options: OptionsType) {
  const {withSource = false, outputDir = 'flow-output', commonPath} = options;
  const allOutput = {};
  const thriftPaths = [thriftParsed.filename];
  for (const thriftPath of thriftPaths) {
    const parsed = {
      ...thriftParsed,
      filename: thriftPath,
    };
    const converter = new ThriftFileConverter(thriftPath, withSource, parsed);
    converter
      .getImportAbsPaths()
      .filter(p => thriftPaths.indexOf(p) === -1)
      .forEach(p => thriftPaths.push(p));
    const root = commonPath;
    const relativeThriftPath = path.dirname(
      path.relative(root, converter.thriftPath)
    );
    const jsFilename = path.resolve(
      outputDir,
      relativeThriftPath,
      `${path.basename(thriftPath, '.thrift')}.js`
    );
    allOutput[jsFilename] = converter.generateFlowFile();
  }
  return allOutput;
}
