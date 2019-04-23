
include "./any.thrift"
struct MyStruct {
    1: any.Thing a
    2: map<string, any.Thing> b
    3: map<any.Thing, string> c
}
typedef any.Thing MyTypedef
const any.Thing MyConst = 10;
const set<any.Thing> MySet = [0];
union MyUnion {
  1: any.Thing a
  2: i32 b
}
