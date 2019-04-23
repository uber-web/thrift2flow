
include "./other.thrift"

struct ThingStruct {
    1: other.Thing thing
}
struct OtherStruct {
    1: i32 num
}
typedef i32 OtherStructTypedef
