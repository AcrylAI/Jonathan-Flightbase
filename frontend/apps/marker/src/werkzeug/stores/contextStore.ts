import { atom } from "recoil";
import { Tools } from "@src/werkzeug/defs/annotation";
import { Classes } from "@src/werkzeug/defs/classes";

/** Annotation > Editor에서 사용할 selectTool Store. 선택한 도구를 저장한다 */
export const selectedToolAtom = atom<Tools|-1>({
  key: '@src/werkzeug/stores/contextStore/selectedToolAtom',
  default: -1 // 0:Selection, 1:Hand, 2:Zoom, 3:BBox, 4:Polygon, 5:Issue, 6:NER,
});

/** Annotation > Editor에서 사용할 selectClass Store. 선택한 클래스를 저장한다 */
export const selectedClassAtom = atom<Classes|undefined>({
  key: '@src/werkzeug/stores/contextStore/selectedClassAtom',
  default: undefined
});

