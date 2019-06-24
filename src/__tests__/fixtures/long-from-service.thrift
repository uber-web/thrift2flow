service Validate {
  bool getStatus(
    1: string userUUID
  ),

  string getSummary(
    1: string userUUID,
    2: i64 (js.type = "long") startTime,
    3: i64 (js.type = "long") endTime
  )
}