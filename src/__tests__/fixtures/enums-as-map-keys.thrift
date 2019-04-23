enum THE_ENUM_PROP {
    DEFAULT = 0
    LOW = 1,
    HIGH = 2
}

const map<THE_ENUM_PROP, string> THE_STRING_MAP = {
    0: "Some default string",
    1: "Some low string",
    2: "Some high string"
}

// Even though in thrift these two types are the same,
// thriftrw will decode them seperately. the first will have keys as `'0'`, `'1'`, etc...
// The one below will have keys `'DEFAULT'`, `'LOW'`, etc...
const map<THE_ENUM_PROP, string> THE_STRING_KEY_MAP = {
  THE_ENUM_PROP.DEFAULT: 'some other default',
  THE_ENUM_PROP.LOW: 'some other low',
  THE_ENUM_PROP.HIGH: 'some other high',
}