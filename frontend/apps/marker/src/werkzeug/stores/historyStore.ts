import { atom } from "recoil";
import { IssueLog, LabelLog } from "@src/werkzeug/defs/history";

/** API 통신을 위해 생성, 수정, 삭제된 Label의 목록을 저장하기 위한 Store */
export const labelLogAtom = atom<LabelLog>({
  key: '@src/werkzeug/stores/historyStore/labelHistoryAtom',
  default: {
    add: [],
    edit: [],
    remove: []
  }
});

/** 이슈에 대해 생성, 수정, 삭제를 Issue의 목록을 저장하기 위한 Store */
export const issueLogAtom = atom<IssueLog>({
  key: '@src/werkzeug/stores/historyStore/issueHistoryAtom',
  default: {
    add: [],
    edit: [],
    remove: []
  }
})