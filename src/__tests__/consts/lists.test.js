// @flow

import {Thrift} from 'thriftrw';
import {ThriftFileConverter} from '../../main/convert';

test('const lists are transformed  correctly', () => {
  const fixturePath = 'src/__tests__/fixtures/const-list-of-lists.thrift';
  const thrift = new Thrift({
    entryPoint: fixturePath,
    allowFilesystemAccess: true
  });
  expect(thrift.BBB_LIST).toEqual(['BBB']);

  const converter = new ThriftFileConverter(fixturePath, false);
  const jsContent = converter.generateFlowFile();
  console.log(jsContent);
  expect(jsContent).toMatchInlineSnapshot(`
"// @flow

export const AAA: \\"AAA\\" = \\"AAA\\";

export const BBB: \\"BBB\\" = \\"BBB\\";

export const CCC: \\"CCC\\" = \\"CCC\\";

export const DDD: \\"DDD\\" = \\"DDD\\";

export const EEE: \\"EEE\\" = \\"EEE\\";

export const FFF: \\"FFF\\" = \\"FFF\\";

export const BBB_LIST: string[] = [BBB];

export const DDDEEEFFF: string[] = [DDD, EEE, FFF];

export const DDDEEEFFF_ALIAS = DDDEEEFFF;

export const CCCAAA: string[] = [CCC, AAA];

export const CUSTOM_AND_DL_MODEL_TYPES: string[][] = [DDDEEEFFF_ALIAS, CCCAAA];
"
`);
});
