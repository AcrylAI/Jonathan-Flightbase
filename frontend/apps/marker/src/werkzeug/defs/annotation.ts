import { SelectOption } from "./classes";

/** 현재 전달받은 파일의 상태 값 대한 정의 */
export type FileStatus = 0 | 1 | 2 | 3 | 4 | 5; // 0:미할당, 1:완료, 2:작업중, 3:검수중, 4:반려됨

/** Adjustment의 Type을 정의 */
export type Adjustment = {
  brightness: number;
  contrast: number;
  saturation: number;
}

/** Detail Job api에서 전달받은 데이터에 대한 타입 정의 */
export type Job = {
  allWork: number;
  annotations: Array<Annotation>;
  createdAt: string;
  currentCnt: number;
  doneWork: number;
  fileName: string;
  fileStatus: FileStatus; // 0:미할당, 1:완료, 2:작업중, 3:검수중, 4:반려됨
  issue: Array<Issue>;
  labelFlag: number; // 0:뷰어, 1:라벨러, 2:리뷰어
  labelerId: number;
  labelerName: string;
  nextId: number;
  prevId: number;
  projectId: number;
  reviewerId: number;
  reviewerName: string;
  url: string;
  rejectCnt: number;
  projectName: string;
};

/** Detail Job api에서 전달받은 데이터 중 어노테이션 정보에 대한 타입 정의 */
export type Annotation = {
  classId: number;
  className: string;
  color: string;
  coordinates: Array<Coordinatum>;
  id: number;
  issue: string|null;
  properties: Array<Propertum>;
  status: 0|1|2|3; // 0:없음, 1:이슈있음, 2:강조, 3:이슈처리대기
  type: 1|2; // 1: bbox, 2: polygon
  visibility?: boolean;
  add?: boolean;
};

/** Editor에서 Coordinate를 다루기 위해 정의한 타입 */
export type Coordinatum = {
  id: number;
  x: number;
  y: number;
};

/** Editor에서 Property를 다루기 위해 정의한 타입 */
export type Propertum = {
  id: number;
  name: string;
  select: number; // 0:single, 1:multi
  data: Array<SelectOption>;
};

/** Label을 정의한 타입 */
export type Label = {
  classId: number;
  className: string;
  type: 1 | 2 | 3; // 1: bbox, 2: polygon, 3:ner
  annotation: Array<Annotation>;
  visibility?: boolean;
  jobId?: number;
}

export type Issue = {
  id: number;
  x: number;
  y: number;
  comment: string;
  warning: 0 | 1; // 0:강조 안함, 1:강조함
  status: 0 | 1; // 0: 이슈, 1: 해결됨
  visibility?: boolean;
  add?: boolean;
  saved?: boolean;
}

/**
 * -1:notSelect, 0:Selection, 1:Hand, 2:Zoom, 3:BBox, 4:Polygon, 5:Issue, 6:NER
 */
export type Tools = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * -1:Error Case, 0:Loading, 1:Ready
 */
export type ImageOnLoad = -1 | 0 | 1;