import { atom } from 'recoil';
export type ChangePassModalAtomType = {
  password: string;
  checkPass: string;
  valid: boolean;
};
export const ChangePassModalAtom = atom<ChangePassModalAtomType>({
  key: '@/src/organisms/Modal/ChangePassModal',
  default: { password: '', checkPass: '', valid: false },
});
