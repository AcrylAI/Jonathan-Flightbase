import { ClassType, PropertySelectionType } from '@tools/types/classes';
import { ColorPickSet, NumericBooleanType } from '@tools/types/components';
import { ToolType } from '@tools/types/label';

/* TEXT ANNOTATION AREA --------------------------------------------------------------------------------- */
export type TextAnnotationCoordinateType = {
  start: number;
  end: number;
};

export type TextAnnotationType = {
  id: number;
  classId: number;
  text: string;
  className: string;
  comment?: string;
  status?: NumericBooleanType;
} & Pick<TextAnnotationCoordinateType, 'start' | 'end'> &
  Pick<ClassType, 'color'>;
/* --------------------------------------------------------------------------------- TEXT ANNOTATION AREA */

/* IMAGE ANNOTATION AREA -------------------------------------------------------------------------------- */
/**
 *
 */
export type ImageAnnotationCoordinateType = {
  x: number;
  y: number;
  id: number;
};

/**
 *
 */
export type ImageAnnotationPropertyDataType = {
  tag_id: number;
  id: number;
  name: string;
};

/**
 *
 */
export type ImageAnnotationPropretyType = {
  data: Array<ImageAnnotationPropertyDataType>;
  id: number;
  name: string;
  select: PropertySelectionType;
};

/**
 * @param classId { number } annotation의 classId
 * @param className { string } annotation의 className
 * @param color { ColorPickSet } annotation의 ClassColor
 * @param coordinates { Array<ImageAnnotationCoordinateType> } annotation의 Coordidnates
 * @param id { number } Annotation의 Id
 * @param properties { Array<ImageAnnotationPropretyType> } 속성에 대한 정보
 * @param type { ToolType } Annotation의 종류
 * @param issue { null } @deprecated
 * @param status { number } @deprecated
 */
export type ImageAnnotationType = {
  classId: number; // annotation의 classId
  className: string; // annotation의 className
  color: ColorPickSet; // annotation의 ClassColor
  coordinates: Array<ImageAnnotationCoordinateType>; // annotation의 Coordidnates
  id: number; // Annotation의 Id
  issue: null; // @deprecated
  properties: Array<ImageAnnotationPropretyType>; // 속성에 대한 정보
  status: number; // ?
  type: ToolType; // Annotation의 종류
};
/* -------------------------------------------------------------------------------- IMAGE ANNOTATION AREA */
