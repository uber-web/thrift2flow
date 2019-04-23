
include "./shared.thrift"

typedef shared.OtherStruct MyOtherStruct

struct MyStruct {
  1: shared.OtherStruct f_OtherStruct
  2: MyOtherStruct f_MyOtherStruct
  3: shared.OtherStructTypedef f_OtherStructTypedef
}
