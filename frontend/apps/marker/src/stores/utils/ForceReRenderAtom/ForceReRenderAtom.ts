import { atom } from 'recoil';

const forceReRenderAtom = atom<boolean>(
  (() => {
    return {
      key: 'utils/ForceReRender',
      default: false,
    };
  })(),
);

export { forceReRenderAtom };
