
enum EntityType {
    A = 0,
    B  = 1,
}

enum Weekday {
    UNKNOWN   = 0
    SUNDAY    = 1
    MONDAY    = 2
    TUESDAY   = 3
    WEDNESDAY = 4
    THURSDAY  = 5
    FRIDAY    = 6
    SATURDAY  = 7
}

struct TimeRange {
    1: optional Weekday weekDay
}