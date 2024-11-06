import { ColorPickSet, NumericBooleanType } from '@tools/types/components';
import { ClassesResultType } from '@tools/types/fetch';
import { ToolType } from '@tools/types/label';
import {
  MULTIPLE_SELECTION_TYPE,
  SINGLE_SELECTION_TYPE,
} from '@tools/types/literal';

/**
 * 0: Single Selection
 * 1: Multiple Selection
 */
export type PropertySelectionType =
  | typeof SINGLE_SELECTION_TYPE
  | typeof MULTIPLE_SELECTION_TYPE;

/**
 * @param color { ColorPickSet } Class의 컬러값
 * @param deleted { NumericBooleanType } Class의 삭제 여부
 * @param id { number } Class의 id
 * @param name { string } Class의 이름
 * @param property { Array<ClassPropertyType> } Class의 속성 값
 * @param tool { ToolType } Class의 도구 값
 */
export type ClassType = ClassesResultType;

/**
 * @param deleted { NumericBooleanType } Class 속성의 삭제 여부
 * @param id { number } Class 속성의 id
 * @param name { string } Class 속성의 이름
 * @param options { Array<ClassPropertyOptionType> } Class 속성의 옵션값
 * @param required { NumericBooleanType } Class 속성의 필수여부
 * @param type { PropertySelectionType } Class 속성의 단일/다중 선택 설정값
 */
export interface ClassPropertyType {
  deleted: NumericBooleanType;
  id: number;
  name: string;
  options: Array<ClassPropertyOptionType>;
  required: NumericBooleanType;
  type?: PropertySelectionType;
}

/**
 * @param id { number } Class 속성 옵션의 id
 * @param name { string } Class 속성 옵션의 이름
 * @param deleted { NumericBooleanType } Class 속성의 삭제 여부
 */
export interface ClassPropertyOptionType {
  id: number;
  name: string;
  deleted: NumericBooleanType;
}
