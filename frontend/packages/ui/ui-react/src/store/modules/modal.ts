import { handleActions, createAction } from 'redux-actions';
export const MODAL_OPEN = 'modal/OPEN';
export const MODAL_CLOSE = 'modal/CLOSE';
export const MODAL_FULL_SIZE = 'modal/FULL_SIZE';

export const modalOpen = createAction(MODAL_OPEN);
export const modalClose = createAction(MODAL_CLOSE);
export const modalFullSize = createAction(MODAL_FULL_SIZE);

export type ModalAction =
  | ReturnType<typeof modalOpen>
  | ReturnType<typeof modalClose>
  | ReturnType<typeof modalFullSize>;

export interface ModalState {
  isOpen: boolean;
  isFullSize: boolean;
  headerRender?: any;
  contentRender?: any;
  footerRender?: any;
}

export const initModalState: ModalState = {
  isOpen: false,
  isFullSize: false,
  headerRender: null,
  contentRender: null,
  footerRender: null,
};

export default handleActions<ModalState, ModalAction>(
  {
    [MODAL_OPEN]: (state: ModalState, { payload }: ModalAction) => ({
      ...state,
      isOpen: payload.isOpen,
      headerRender: payload.headerRender,
      contentRender: payload.contentRender,
      footerRender: payload.footerRender,
    }),
    [MODAL_CLOSE]: (state: ModalState) => ({
      ...state,
      isOpen: false,
      headerRender: null,
      contentRender: null,
      footerRender: null,
      isFullSize: false,
    }),
    [MODAL_FULL_SIZE]: (state: ModalState, { payload }: ModalAction) => ({
      ...state,
      isFullSize: payload.isFullSize,
    }),
  },
  initModalState,
);
