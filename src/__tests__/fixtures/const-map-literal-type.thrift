

enum ShieldType {
  O = 0
  U = 1
}

const string o = "ooooooo";

const map<ShieldType, i32> PRIORITIES = {
  ShieldType.O: 2,
  ShieldType.U: 10,
}

const map<ShieldType, string> LABELS = {
  ShieldType.O: o,
  ShieldType.U: "uuuuuuu",
}

const map<ShieldType, list<string>> THINGS = {
  ShieldType.O: [o, "abcd"],
  ShieldType.U: ["uuuuuuu"],
}

const map<i32, string> NUMS = {
  0: "aaa",
  1: "bbb",
}