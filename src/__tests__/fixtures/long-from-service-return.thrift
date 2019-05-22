service Validate {
  i64 (js.type = "long") getStatus(
    1: string userUUID
  )
}