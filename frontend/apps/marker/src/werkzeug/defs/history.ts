import { Position } from "./draw";
import { Issue } from "./annotation";

export type EditOptions = {
  optionId: number;
}
export interface EditInfo {
  id?: number;
  coordinates?: Array<Position>;
  classId?: number;
  properties?: Array<EditOptions>;
}
export interface Addition extends EditInfo {
  coordinates: Array<Position>;
  classId: number;
}
export interface Edition extends EditInfo {
  id: number;
}
export type LabelLog = {
  add: Array<Addition>;
  edit: Array<Edition>;
  remove: Array<number>;
}

export type IssueLog = {
  add: Array<Issue>;
  edit: Array<Issue>;
  remove: Array<number>;
}