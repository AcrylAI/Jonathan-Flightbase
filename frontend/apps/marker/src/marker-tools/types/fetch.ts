import { ImageAnnotationType } from '@tools/types/annotation';
import { ClassPropertyType, PropertySelectionType } from '@tools/types/classes';
import { ColorPickSet, NumericBooleanType } from '@tools/types/components';
import {
  FileStatus,
  IssueType,
  ToolType,
  UserFlagType,
} from '@tools/types/label';

/**
 * @param allWork { number } 할당된 전체 작업
 * @param annotations { Array<ImageAnnotationType> } 라벨링 리스트
 * @param createdAt { string } 파일이 만들어진 시간
 * @param currentCnt { number } 현재 작업의 위치?
 * @param doneWork { number } 완료된 작업의 개수
 * @param fileName { string } 파일의 이름
 * @param fileStatus { FileStatus } 현재 파일의 작업 상태
 * @param issue { any[] } 이슈 리스트
 * @param labelFlag { UserFlagType } 1이면 라벨러, 2면 리뷰어, 뷰어
 * @param labelerId { number } 라벨러의 uid
 * @param labelerName { string } 라벨러의 id
 * @param nextId { number } 다음 작업의 jid
 * @param prevId { number } 이전 작업의 jid
 * @param projectId { number } 프로젝트의 id
 * @param projectName { string } 프로젝트의 이름
 * @param rejectCnt { number } 반려된 작업의 개수
 * @param reviewerId { number } 리뷰어의 uid
 * @param reviewerName { string } 리뷰어의 id
 * @param url { string } 이미지의 주소
 */
export interface JobDetailResultType<T> {
  allWork: number;
  annotations: Array<T>;
  createdAt: string;
  currentCnt: number;
  doneWork: number;
  fileName: string;
  fileStatus: FileStatus;
  issue: Array<T>;
  labelFlag: UserFlagType;
  labelerId: number;
  labelerName: string;
  nextId: number;
  prevId: number;
  projectId: number;
  projectName: string;
  rejectCnt: number;
  reviewerId: number;
  reviewerName: string;
  url?: string;
  text?: string;
}

/**
 * @param color { ColorPickSet } Class의 컬러값
 * @param deleted { NumericBooleanType } Class의 삭제 여부
 * @param id { number } Class의 id
 * @param name { string } Class의 이름
 * @param property { Array<ClassPropertyType> } Class의 속성 값
 * @param tool { ToolType } Class의 도구 값
 * @param depth { number } 클래스의 depth
 * @param parent_id { number } 부모 class의 id
 * @param required { NumericBooleanType } 이 클래스를 필수로 선택해야하는지
 * @param selection { PropertySelectionType } 이 클래스가 단일 선택인지 다중 선택인지
 * @param status { NumericBooleanType } 이 클래스의 활성화 여부
 */
export interface ClassesResultType {
  color: ColorPickSet; // Class의 컬러값
  deleted: NumericBooleanType; // Class의 삭제 여부
  id: number; // Class의 id
  name: string; // Class의 이름
  tool: ToolType; // Class의 도구 값
  property?: Array<ClassPropertyType>; // Class의 속성 값
  depth?: number;
  parent_id?: number;
  required?: NumericBooleanType;
  selection?: PropertySelectionType;
  status?: NumericBooleanType; // 0: 비활성, 1: 활성
}
