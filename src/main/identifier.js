// @flow
const reservedTypes = [
  'any',
  'mixed',
  'number',
  'throw',
  'Class',
  'Object',
  'Symbol',
];

export function id(s: string): string {
  const split = s.split('.');
  if (reservedTypes.includes(s) || reservedTypes.includes(split[0])) {
    return `_${s}`;
  }

  if (split.length > 1) {
    const lastItem = split.pop();
    if (reservedTypes.includes(lastItem)) {
      s = split.join('.') + `.${id(lastItem)}`;
    }
  }
  return s;
}
