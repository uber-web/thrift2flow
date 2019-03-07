# thrift2flow

[![Build status](https://badge.buildkite.com/56a997e5c7caeaa4969da9add5c6435a1d00381d4aee1edf6f.svg?branch=master)](https://buildkite.com/uberopensource/thrift2flow)

Automagically converts [Apache Thrift](https://thrift.apache.org/) specs to
[Flowtype](https://flow.org/) type definition files!

NOTE: This library tries to align with the [thriftrw](https://github.com/thriftrw/thriftrw-node) JS semantics which means it may not be compatible with generated code
from the apache thrift project.

Example:

```thrift
typedef string UUID

struct Customer {
  1: UUID id
  2: string name
  3: i32 age
  4: list<string> tags
}
```

Output:

```js
export type UUID = string;

export type Customer = {
  id: UUID,
  name: string,
  age: number,
  tags: string[],
};
```

## Installation and Usage

```
npm install -g thrift2flow
thrift2flow --path="idl/code.foo.bar" --outputDir="src/types/idl" idl/code.foo.bar/*/*/*.thrift
```

## Contributing

We'd love for you to contribute to this project. Before we can accept your contributions, we kindly
ask you to sign our [Uber Contributor License Agreement](https://docs.google.com/a/uber.com/forms/d/1pAwS_-dA1KhPlfxzYLBqK6rsSWwRwH95OCCZrcsY5rk/viewform).

- If you **find a bug**, please open an issue, or submit a fix via a pull request
- If you **have a feature request**, open an issue, or submit an implementation via a pull request
- If you **want to contribute**, submit a pull request

Thanks!
