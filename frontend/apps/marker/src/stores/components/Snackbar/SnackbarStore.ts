import { atom } from "recoil";
import { ReactNode } from "react";

type SnackBarType = {
  show: boolean;
  contents: ReactNode;
}

export const snackbarAtom = atom<SnackBarType>({
  key: '@src/stores/components/Snackbar/SnackbarStore/snackbarAtom',
  default: {
    show: false,
    contents: null
  }
})