import { ImageAnnotationType } from '@tools/types/annotation';
import { NumericBooleanType } from '@tools/types/components';
import {
  ALLOWED_FILESTATE,
  BBOXTOOL,
  IMAGEDATA,
  INSPECTION_FILESTATE,
  NERTOOL,
  NOTALLOWED_FILESTATE,
  POLYGONTOOL,
  REJECTION_FILESTATE,
  TEXTDATA,
  TOOLBOX_BBOX_TOOL,
  TOOLBOX_HAND_TOOL,
  TOOLBOX_ISSUE_TOOL,
  TOOLBOX_NER_TOOL,
  TOOLBOX_POLYGON_TOOL,
  TOOLBOX_SELECTION_TOOL,
  TOOLBOX_ZOOM_IN_TOOL,
  TOOLBOX_ZOOM_OUT_TOOL,
  USER_TYPE_LABELER,
  USER_TYPE_REVIEWER,
  USER_TYPE_VIEWER,
  WORKING_FILESTATE,
} from '@tools/types/literal';

/**
 * 현재 전달받은 파일의 상태 값 대한 정의
 * 0:미할당, 1:완료, 2:작업중, 3:검수중, 4:반려됨
 */
export type FileStatus =
  | typeof NOTALLOWED_FILESTATE
  | typeof ALLOWED_FILESTATE
  | typeof WORKING_FILESTATE
  | typeof INSPECTION_FILESTATE
  | typeof REJECTION_FILESTATE;

/**
 * 도구의 타입을 Numeric Literal로 표시
 */
export type ToolType = typeof BBOXTOOL | typeof POLYGONTOOL | typeof NERTOOL;

/**
 * Data의 타입을 Numeric Literal로 표시
 */
export type DataType = typeof IMAGEDATA | typeof TEXTDATA | number;

/**
 *  "select" | "hand" | "zoomin" | "zoomout" | "bbox" | "polygon" | "issue"
 */
export type ToolboxType =
  | typeof TOOLBOX_SELECTION_TOOL
  | typeof TOOLBOX_HAND_TOOL
  | typeof TOOLBOX_ZOOM_IN_TOOL
  | typeof TOOLBOX_ZOOM_OUT_TOOL
  | typeof TOOLBOX_BBOX_TOOL
  | typeof TOOLBOX_POLYGON_TOOL
  | typeof TOOLBOX_ISSUE_TOOL
  | typeof TOOLBOX_NER_TOOL;

/**
 * 0: View,
 * 1: Labeler,
 * 2: Reviewer
 */
export type UserFlagType =
  | typeof USER_TYPE_VIEWER
  | typeof USER_TYPE_LABELER
  | typeof USER_TYPE_REVIEWER;

/**
 *
 */
export interface LabelType {
  classId: number;
  className: string;
  classDeleted: NumericBooleanType;
  annotation: Array<
    Pick<ImageAnnotationType, 'id' | 'type' /* | 'classId' | 'className' */>
  >;
}

/**
 * @param comment { string } Issue에 작성된 Comment
 * @param id { number } Issue의 id 값
 * @param job_id { number } Issue가 작성된 작업의 id 값
 * @param status { NumericBooleanType } Issue의 resolve 여부
 * @param user_id { any } Issue를 작성한 user의 id 값
 * @param warning { NumericBooleanType } Issue의 강조 여부
 * @param x { number } Issue가 표시된 x 좌표
 * @param y { number } Issue가 표시된 y 좌표
 */
export interface IssueType {
  comment: string;
  id: number;
  job_id: number;
  status: NumericBooleanType;
  user_id: any;
  warning: NumericBooleanType;
  x: number;
  y: number;
}
