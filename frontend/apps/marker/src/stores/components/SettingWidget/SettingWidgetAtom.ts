import { atom } from 'recoil';

export interface SettingWidgetAtomType {
  refetch: () => void;
}

export const SettingWidgetAtom = atom<SettingWidgetAtomType>({
  key: `@atom/components/SettingWidgetAtom`,
  default: {
    refetch: () => {},
  },
});
