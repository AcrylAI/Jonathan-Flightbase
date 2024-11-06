import { atom } from "recoil";
import { ImageOnLoad, Job } from "@src/werkzeug/defs/annotation";
import { Classes } from "@src/werkzeug/defs/classes";

/** API로부터 전달받은 Job의 세부적인 내용을 저장하기 위한 Store */
export const jobInfoAtom = atom<Job|undefined>({
  key: '@src/werkzeug/stores/fetchStore/jobInfoAtom',
  default: undefined
});

/** Api를 통해 전달받은 Class의 리스트를 저장하기 위한 Store */
export const classListAtom = atom<Array<Classes>>({
  key: '@src/werkzeug/stores/fetchStore/classListAtom',
  default: []
});

/**
 * 마지막 submit한 id 값을 저장하는 Store
 * annotation page 이탈까지 초기화 금지
 */
export const latestSubmitAtom = atom<number>({
  key: '@src/werkzeug/stores/fetchStore/latestSubmitAtom',
  default: 0
})

/** Skeleton을 사용하기 위한 Store */
export const onDataLoadAtom = atom<ImageOnLoad>({
  key: '@src/werkzeug/stores/fetchStore/onDataLoad',
  default: 0
})