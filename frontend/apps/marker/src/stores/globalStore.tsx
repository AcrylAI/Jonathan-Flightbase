import { atom } from 'recoil';

export const selectedSideMenuItem = atom<string>({
  key: 'selectedSideMenuItem',
  default: '',
});

export const loadingStore = atom<{ [key: string]: boolean }>({
  key: 'loadingStatus',
  default: {},
});

export const templateStore = atom<boolean>({
  key: 'templateStore',
  default: false,
});
