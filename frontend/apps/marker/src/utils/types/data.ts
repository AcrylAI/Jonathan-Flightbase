export type DataTableColumnType = {
  checkList?: React.ReactNode;
  id?: number;
  thumbnail?: string;
  fileName?: string;
  sync?: number;
  updatedAt?: string;
  labeler?: string;
  review?: string;
  autoLabeling?: number;
  workingStatus?: number;
  disableStatus?: boolean;
  index?: number;
  name?: string;
};

export type MemberTableColumnType = {
  id: number;
  label: string;
  name: string;
  type: number;
  status: boolean;
  memo?: string;
  grade?: number;
  reviewData?: number;
  participateProject?: number;
  manageProject?: number;
  labelingData: number;
  search?: string;
};

export type ModelsTableColumnType = {
  access?: number;
  createdAt?: string;
  deploymentName?: string;
  description?: string;
  id: number;
  modelName?: string;
  owner?: string;
  status: boolean;
  userList?: string;
  worker?: number;
  active: number;
};

type DataResultType = {
  complete: number;
  connected: number;
  list: Array<DataTableColumnType>;
  notAssigned: number;
  total: number;
  working: number;
};

export type DataType = {
  code: number;
  httpStatus: number;
  location: string;
  message: string;
  result: DataResultType;
};

export type ReviewerListType = {
  id: number;
  name: string;
};

export type LabelerListType = {
  id: number;
  name: string;
};

export interface FilterDataType {
  column: string;
  condition: number & Array<number>;
  value?: string;
  label?: string;
}
