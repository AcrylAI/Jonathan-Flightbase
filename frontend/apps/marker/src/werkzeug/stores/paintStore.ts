import { atom } from "recoil";
import { Adjustment, Annotation, Issue, Label, Propertum } from "@src/werkzeug/defs/annotation";
import { Mode } from "@src/werkzeug/defs/draw";

/** Annotation > Editor에서 사용할 adjustment Store. Adjustment를 조절하면 paint의 색이 변하도록 수정함 */
export const adjustmentAtom = atom<Adjustment>({
  key: '@src/werkzeug/stores/paintStore/adjustmentAtom',
  default: {
    saturation: 100,
    brightness: 100,
    contrast: 100
  }
});

/** Zoom의 scale 값을 저장하기 위한 Store */
export const scaleAtom = atom<number>({
  key: '@src/werkzeug/stores/paintStore/zoomAtom',
  default: -1,
})

/** Api를 통해 전달받은 Job의 내역에 ClassList를 붙여 관리하기 위한 Store */
export const labelListAtom = atom<Array<Label>>({
  key: '@src/werkzeug/stores/paintStore/labelListAtom',
  default: []
});

/** 선택한 Label 데이터를 저장하기 위한 Store */
export const selectedAnnotationAtom = atom<Annotation|undefined>({
  key: '@src/werkzeug/stores/paintStore/selectedAnnotationAtom',
  default: undefined
});

/** 선택한 속성 값을 저장하기 위한 Store */
export const selectedPropertiesAtom = atom<Array<Propertum>>({
  key: '@src/werkzeug/stores/paintStore/selectedPropertiesAtom',
  default: []
});

/** JobDetail에서 읽어온 Issue를 다루기 위한 Store */
export const issueListAtom = atom<Array<Issue>>({
  key: '@src/werkzeug/stores/paintStore/issueListAtom',
  default: []
});

/** Paint에서 선택된 이슈의 정보를 저장하기 위한 Store */
export const selectedIssueAtom = atom<Issue|undefined>({
  key: '@src/werkzeug/stores/paintStore/selectedIssueAtom',
  default: undefined
});

/** Paint에서 선택된 도형을 수정할 때 이를 React 컴포넌트에 알리기 위한 Store */
export const shapeModifyModeAtom = atom<Mode>({
  key: '@src/werkzeug/stores/paintStore/shapeModifyModeAtom',
  default: {
    ready: false,
    active: false
  }
})