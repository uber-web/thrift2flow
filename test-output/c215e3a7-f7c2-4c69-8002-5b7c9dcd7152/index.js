
            // @flow
            import type {MyStructXXX} from './types';

            function go(s : MyStructXXX) {
              const numbers : number[] = [s.f_OtherStruct.num];
              return [numbers];
            }
          