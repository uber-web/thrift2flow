

enum ShieldType {
  O = 0
  U = 1
}

const map<ShieldType, i32> PRIORITIES = {
  ShieldType.O: 2,
  ShieldType.U: 10,
}

const map<ShieldType, string> LABELS = {
  ShieldType.O: "ooooooo",
  ShieldType.U: "uuuuuuu",
}