include './a/common.thrift'
include './unrelated.thrift'

struct Foo {
  1: optional common.EntityTypeA propA
}