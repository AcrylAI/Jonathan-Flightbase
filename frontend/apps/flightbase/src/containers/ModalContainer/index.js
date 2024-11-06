import { lazy } from 'react';
export { default } from './ModalContainer';

export const WorkspaceFormModalContainer = lazy(() =>
  import('./WorkspaceFormModalContainer'),
);
export const TrainingFormModalContainer = lazy(() =>
  import('./TrainingFormModalContainer'),
);
export const DeploymentFormModalContainer = lazy(() =>
  import('./DeploymentFormModalContainer'),
);
export const DockerImageFormModalContainer = lazy(() =>
  import('./DockerImageFormModalContainer'),
);
export const BuiltinModelFormModalContainer = lazy(() =>
  import('./BuiltinModelFormModalContainer'),
);
export const UserFormModalContainer = lazy(() =>
  import('./UserFormModalContainer'),
);
export const DockerImageDeleteModalContainer = lazy(() =>
  import('./DockerImageDeleteModalContainer'),
);
export const JobCreateFormModalContainer = lazy(() =>
  import('./JobCreateFormModalContainer'),
);
export const JobLogModalContainer = lazy(() =>
  import('./JobLogModalContainer'),
);
export const HpsLogModalContainer = lazy(() =>
  import('./HpsLogModalContainer'),
);
export const DatasetFormModalContainer = lazy(() =>
  import('./DatasetFormModalContainer'),
);
export const FileUploadFormModalContainer = lazy(() =>
  import('./FileUploadFormModalContainer'),
);
export const FolderFormModalContainer = lazy(() =>
  import('./FolderFormModalContainer'),
);
export const FileFormModalContainer = lazy(() =>
  import('./FileFormModalContainer'),
);
export const SystemLogModalContainer = lazy(() =>
  import('./SystemLogModalContainer'),
);
export const JsonViewModalContainer = lazy(() =>
  import('./JsonViewModalContainer'),
);
export const PreviewModalContainer = lazy(() =>
  import('./PreviewModalContainer'),
);
export const CheckpointModalContainer = lazy(() =>
  import('./CheckpointModalContainer'),
);
export const WsDescFormModalContainer = lazy(() =>
  import('./WsDescFormModalContainer'),
);
export const GPUSettingFormModalContainer = lazy(() =>
  import('./GPUSettingFormModalContainer'),
);
export const UserGroupFormModalContainer = lazy(() =>
  import('./UserGroupFormModalContainer'),
);
export const PasswordFormModalContainer = lazy(() =>
  import('./PasswordFormModalContainer'),
);
export const DeployWorkerMemoModalContainer = lazy(() =>
  import('./DeployWorkerMemoModalContainer'),
);

export const LocalFileFormModalContainer = lazy(() =>
  import('./LocalFileFormModalContainer'),
);
export const StorageSettingModalContainer = lazy(() =>
  import('./StorageSettingModalContainer'),
);
export const TemplateModalContainer = lazy(() =>
  import('./TemplateModalContainer'),
);
export const DockerImageLogModalContainer = lazy(() =>
  import('./DockerImageLogModalContainer'),
);
export const HanlimUploadModalContainer = lazy(() =>
  import('./HanlimUploadModalContainer'),
);
