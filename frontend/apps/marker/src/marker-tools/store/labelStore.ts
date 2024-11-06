import { atom } from 'recoil';

import { ToolboxType } from '@tools/types/label';
import { TOOLBOX_SELECTION_TOOL } from '@tools/types/literal';

export const labelListAtom = atom<Array<any>>({
  key: '@tools/store/labelStore/labelListAtom',
  default: [],
});

export const issueListAtom = atom<Array<any>>({
  key: '@tools/store/labelStore/issueListAtom',
  default: [],
});

export const selectedToolAtom = atom<ToolboxType>({
  key: '@tools/store/labelStore/selectedToolAtom',
  default: TOOLBOX_SELECTION_TOOL,
});

export const latestSubmitAtom = atom<number>({
  key: '@tools/store/labelStore/latestSubmitAtom',
  default: 0
})