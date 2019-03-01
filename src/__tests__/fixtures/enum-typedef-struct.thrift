typedef MyEnum EnumTypedef

enum MyEnum {
  OK = 1
  ERROR = 2
}

struct MyStruct {
  1: MyEnum f_MyEnum
  2: EnumTypedef f_EnumTypedef
}