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
  return s;
}
