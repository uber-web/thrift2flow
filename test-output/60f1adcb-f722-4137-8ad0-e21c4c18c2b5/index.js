
// @flow
import {MyEnumValueMap} from './types';
import type {EnumTypedefXXX,MyEnumXXX} from './types';

const ok: MyEnumXXX = 'OK';
const error: MyEnumXXX = 'ERROR';

const okFromMap: 1 = MyEnumValueMap.OK;
const errorFromMap: 2 = MyEnumValueMap.ERROR;

const t: EnumTypedefXXX = ok;
