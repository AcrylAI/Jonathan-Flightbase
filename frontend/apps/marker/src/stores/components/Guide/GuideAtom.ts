import { atom } from 'recoil';

export type GuideModel = {
  video: string;
  title: string;
  desc: JSX.Element;
  thumbnail?: string;
};

export type GuideAtomModel = {
  guideList: Array<GuideModel>;
  curIdx: number;
  curPage: number;
};

const GuideAtom = atom<GuideAtomModel>({
  key: '@/src/stores/Guide/GuideAtom',
  default: {
    guideList: [],
    curIdx: 0,
    curPage: 1,
  },
});
export default GuideAtom;
