import { fetcher, METHOD } from '@src/network/api/api';
import { useMutation } from 'react-query';
export type CreateNewProjectClassPropsOptModel = {
  id?: number;
  deleted?: number;
  name: string;
};
export type CreateNewProjectClassPropsModel = {
  id?: number;
  deleted?: number;
  name: string;
  type: number;
  required: number;
  options: Array<CreateNewProjectClassPropsOptModel>;
};
export type CreateNewProjectClassModel = {
  id?: number;
  deleted?: number;
  name: string;
  color: string;
  tool: number;
  property: Array<CreateNewProjectClassPropsModel>;
};

export type CreateNewProjectRequestModel = {
  name: string;
  type: number;
  data: string;
  tools: Array<number>;
  worker: Array<number>;
  mobile: number;
  workflow: number;
  description: string;
  workspaceId: number;
  classes: Array<CreateNewProjectClassModel>;
};
export const useCreateNewProject = () => {
  return useMutation(
    ['@components/organism/Modal/ProjectModal/useCreateNewProject'],
    fetcher.mut<CreateNewProjectRequestModel>({
      url: '/project',
      method: METHOD.POST,
    }),
  );
};
