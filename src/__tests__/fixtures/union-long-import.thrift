union RawValue {
 1: optional binary binaryValue                 // BLOB, UUID
 2: optional bool boolValue                     // BOOL
 3: optional double doubleValue                 // DOUBLE
 4: optional i32 int32Value                     // INT32
 5: optional i64 (js.type = "Long") int64Value  // INT64, TIMESTAMP
 6: optional string stringValue                 // STRING
}