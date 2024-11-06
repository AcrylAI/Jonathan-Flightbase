import { v1 } from 'uuid';
import { atom } from 'recoil';

export const loadingStateAtom = atom<boolean>({
  key: `ui/loading/${v1()}`,
  default: false,
});
