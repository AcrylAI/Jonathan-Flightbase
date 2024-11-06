import { v1 } from 'uuid';
import { atom } from 'recoil';

export const popupStateAtom = atom<boolean>({
  key: `ui/popup/${v1()}`,
  default: false,
});
