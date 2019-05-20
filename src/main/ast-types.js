// @flow

type Annotations = {|
  'js.type'?: 'long' | 'Long' | 'Date',
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
  fieldType: Identifier | Literal,
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
  valueType: Identifier | BaseType,
|};

export type FunctionDefinition = {|
  id: Identifier,
  fields: Array<Field>,
  returns: Identifier | BaseType,
|};

export type Service = {|
  id: Identifier,
  type: 'Service',
  functions: Array<FunctionDefinition>,
|};

export type Const = {|
  id: Identifier,
  type: 'Const',
  fieldType: Identifier | Literal | BaseType,
  value: ConstList | ConstEntry | ConstMap | Literal,
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

export type List = {|
  id: Identifier,
  type: 'List',
  valueType: Identifier | BaseType,
|};

export type Map = {|
  id: Identifier,
  type: 'Map',
  keyType: Identifier | BaseType,
  valueType: Identifier | BaseType,
|};

export type Set = {|
  id: Identifier,
  type: 'Set',
  valueType: Identifier | BaseType,
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
  | EnumDefinition
  | Typedef
  | Service
  | Const;

export type AstNode =
  | Definition
  | Identifier
  | Literal
  | BaseType
  | List
  | Map
  | Set
  | Field
  | EnumDefinition
  | Union
  | ConstEntry
  | ConstMap;

export type Ast = {|
  definitions: Array<Definition>,
  headers: $ReadOnlyArray<{|
    type: 'Include',
    // ie., foo.thrift
    id: string,
    namespace: string | null,
    line: number,
    column: number,
  |}>,
|};
