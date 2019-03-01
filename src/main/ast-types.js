// @flow

type Base = {|
  id: {|name: string|},
|};

export type Struct = {|
  ...Base,
  type: 'Struct',
  fields: Array<Field>,
|};

export type Union = {|
  ...Base,
  type: 'Union',
  fields: Array<Field>,
|};

export type Exception = {|
  ...Base,
  type: 'Exception',
  fields: Array<Field>,
|};

export type Field = {|
  ...Base,
  type: 'Field',
  optional: boolean,
|};

export type Enum = {|
  ...Base,
  type: 'Enum',
  definitions: Array<Identifier>,
|};

export type Identifier = {|
  ...Base,
  type: 'Identifier',
  name: string,
|};

export type Typedef = {|
  ...Base,
  type: 'Typedef',
  valueType: Identifier,
|};

export type FunctionDefinition = {|
  ...Base,
  fields: Array<{||}>,
  returns: {||},
|};

export type Service = {|
  ...Base,
  type: 'Service',
  functions: Array<FunctionDefinition>,
|};

export type Const = {|
  ...Base,
  type: 'Const',
  value: ConstList | ConstEntry | ConstMap,
|};

export type Literal = {|
  ...Base,
  type: 'Literal',
  value: string,
|};

export type ConstList = {|
  ...Base,
  type: 'ConstList',
  values: Array<Identifier | Literal>,
|};

export type ConstEntry = {|
  ...Base,
  type: 'ConstEntry',
  key: Literal | Identifier,
  value: Literal | Identifier | ConstMap,
|};

export type ConstMap = {|
  ...Base,
  type: 'ConstMap',
  entries: Array<ConstEntry>,
|};

export type Definition =
  | Struct
  | Enum
  | Typedef
  | Union
  | Exception
  | Const
  | ConstEntry
  | ConstMap
  | Service;
