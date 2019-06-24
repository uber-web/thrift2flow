struct MyStruct {
    1: optional i64 (js.type = "Long") posNum1;
    1: optional i64 (js.type = "long") posNum2;
    1: optional i64 posNum3;
    1: optional i64 (js.type = "Long") negNum1;
    1: optional i64 (js.type = "long") negNum2;
    1: optional i64 negNum3;
}

const MyStruct MY_STRUCT = {
    "posNum1": 1,
    "posNum2": 1,
    "posNum3": 1,
    "negNum1": -1,
    "negNum2": -1,
    "negNum3": -1,
}