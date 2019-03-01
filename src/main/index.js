// @flow

import {ThriftFileConverter} from './convert';
import path from 'path';

type OptionsType = {|
  withSource?: boolean,
  commonPath: string,
  outputDir?: string,
|};

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
