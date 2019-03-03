// @flow

type Annotations = {|
  'js.type'?: 'Long',
|};
type Primitives =
  | 'i8'
  | 'i16'
  | 'string'
  | 'i32'
  | 'i64'
  | 'double'
  | 'void'
  | 'binary'
  | 'bool'
  | 'byte';
export type BaseType = {|
  type: 'BaseType',
  baseType: Primitives,
  annotations: Annotations,
|};

export type Identifier = {|
  type: 'Identifier',
  name: string,
  annotations: Annotations,
|};

export type Struct = {|
  id: Identifier,
  type: 'Struct',
  fields: Array<Field>,
|};

export type Union = {|
  id: Identifier,
  type: 'Union',
  fields: Array<Field>,
|};

export type Exception = {|
  id: Identifier,
  type: 'Exception',
  fields: Array<Field>,
|};

export type FieldIdentifier = {|
  type: 'FieldIdentifier',
  value: number,
  line: number,
  column: number,
|};
export type Field = {|
  id: FieldIdentifier,
  type: 'Field',
  name: string,
  optional: boolean,
  valueType: Identifier | BaseType,
  required: boolean,
  optional: boolean,
  defaultValue: {||} | null,
  annotations: Annotations,
|};

export type EnumDefinition = {|
  type: 'EnumDefinition',
  id: Identifier,
  fieldType: {||},
  value: Literal,
  annotations: Annotations,
|};

export type Enum = {|
  id: Identifier,
  type: 'Enum',
  definitions: Array<EnumDefinition>,
  annotations: Annotations,
|};

export type Typedef = {|
  id: Identifier,
  type: 'Typedef',
  valueType: Identifier,
|};

export type FunctionDefinition = {|
  id: Identifier,
  fields: Array<Field>,
  returns: {||},
|};

export type Service = {|
  id: Identifier,
  type: 'Service',
  functions: Array<FunctionDefinition>,
|};

export type Const = {|
  id: Identifier,
  type: 'Const',
  value: ConstList | ConstEntry | ConstMap,
|};

export type Literal = {|
  id: Identifier,
  type: 'Literal',
  value: string | number,
|};

export type ConstList = {|
  id: Identifier,
  type: 'ConstList',
  values: Array<Identifier | Literal>,
|};

export type ConstEntry = {|
  id: Identifier,
  type: 'ConstEntry',
  key: Literal | Identifier,
  value: Literal | Identifier | ConstMap,
|};

export type ConstMap = {|
  id: Identifier,
  type: 'ConstMap',
  entries: Array<ConstEntry>,
|};

export type Definition =
  | Struct
  | Exception
  | Union
  | Enum
  | Typedef
  | Service
  | Const;

export type AstNode =
  | BaseType
  | Struct
  | Field
  | Enum
  | EnumDefinition
  | Typedef
  | Union
  | Exception
  | Const
  | ConstEntry
  | ConstMap
  | Service;
