// @flow

// This file is copied to lib during build to support Flow
// coverage when used as a dependency.

import _convert, {ThriftFileConverter as _ThriftFileConverter} from '../src/main/index';

export default _convert;
export const ThriftFileConverter = _ThriftFileConverter;
