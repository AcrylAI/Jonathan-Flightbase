import { ModalTemplateArgs } from '@src/components/molecules/FlexibleModal/types';
import { handleActions, createAction } from 'redux-actions';
export const FMODAL_OPEN = 'fmodal/OPEN';
export const FMODAL_CLOSE = 'fmodal/CLOSE';
export const FMODAL_MINIMIZE = 'fmodal/MINIMIZE';
export const FMODAL_MAXIMIZE = 'fmodal/MAXIMIZE';
export const FMODAL_CLOSE_ALL = 'fmodal/CLOSE_ALL';
export const FMODAL_FULLSCREEN = 'fmodal/FULLSCREEN';

export const fmodalOpen = createAction(FMODAL_OPEN);
export const fmodalClose = createAction(FMODAL_CLOSE);
export const fmodalMinimize = createAction(FMODAL_MINIMIZE);
export const fmodalMaximize = createAction(FMODAL_MAXIMIZE);
export const fmodalCloseAll = createAction(FMODAL_CLOSE_ALL);
export const fmodalFullscreen = createAction(FMODAL_FULLSCREEN);

export type FModalAction =
  | ReturnType<typeof fmodalOpen>
  | ReturnType<typeof fmodalClose>
  | ReturnType<typeof fmodalMinimize>
  | ReturnType<typeof fmodalMaximize>
  | ReturnType<typeof fmodalCloseAll>
  | ReturnType<typeof fmodalFullscreen>;

export interface FModalState {
  modalList: ModalTemplateArgs[];
}

export const initModalState: FModalState = {
  modalList: [],
};

export default handleActions<FModalState, FModalAction>(
  {
    [FMODAL_OPEN]: (state: FModalState, { payload }: FModalAction) => ({
      ...state,
      modalList: [...state.modalList, payload.modal],
    }),

    [FMODAL_CLOSE]: (state: FModalState, { payload }: FModalAction) => {
      const fIdx = findModalIndex(state.modalList, payload.modalKey);
      const temp = [...state.modalList];
      if (fIdx !== -1) temp.splice(fIdx, 1);
      return { ...state, modalList: temp };
    },
    [FMODAL_MINIMIZE]: (state: FModalState, { payload }: FModalAction) => {
      const fIdx = findModalIndex(state.modalList, payload.modalKey);
      const temp = [...state.modalList];
      if (fIdx !== -1) {
        temp[fIdx].isMaximize = false;
        temp[fIdx].isMinimize = true;
      }
      return { ...state, modalList: temp };
    },
    [FMODAL_MAXIMIZE]: (state: FModalState, { payload }: FModalAction) => {
      const fIdx = findModalIndex(state.modalList, payload.modalKey);
      const temp = [...state.modalList];
      if (fIdx !== -1) {
        temp[fIdx].isMaximize = true;
        temp[fIdx].isMinimize = false;
      }
      return { ...state, modalList: temp };
    },
    [FMODAL_FULLSCREEN]: (state: FModalState, { payload }: FModalAction) => {
      const fIdx = findModalIndex(state.modalList, payload.modalKey);
      const temp = [...state.modalList];
      if (fIdx !== -1) {
        temp[fIdx].isFullScreen = !temp[fIdx].isFullScreen;
      }
      return { ...state, modalList: temp };
    },

    [FMODAL_CLOSE_ALL]: (state: FModalState, { payload }: FModalAction) => {
      return { ...state, modalList: [] };
    },
  },
  initModalState,
);

/* Utils */
const findModalIndex = (list: ModalTemplateArgs[], key: string) => {
  return list.findIndex((modal) => modal.modalKey === key);
};
