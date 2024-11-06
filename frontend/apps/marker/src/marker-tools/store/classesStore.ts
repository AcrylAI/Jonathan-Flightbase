import { atom } from 'recoil';

import { ClassesResultType } from '@tools/types/fetch';

export const selectedClassAtom = atom<ClassesResultType | null>({
  key: '@tools/store/classesStore/selectedClassAtom',
  default: null,
});
