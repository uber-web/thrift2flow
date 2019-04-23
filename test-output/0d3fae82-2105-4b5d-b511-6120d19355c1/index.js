
// @flow
import type {PrimitivesXXX} from './types';

function go(s : PrimitivesXXX) {
  const numbers : number[] = [s.f_boolean];
  const booleans : boolean[] = [s.f_byte];
  return [numbers, booleans];
}
