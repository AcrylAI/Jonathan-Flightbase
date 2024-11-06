import { atom } from 'recoil';

export const TableHeaderSortAtom = atom<Array<boolean | undefined>>({
  key: '@/components/Table/TableAtom',
  default: [],
});
