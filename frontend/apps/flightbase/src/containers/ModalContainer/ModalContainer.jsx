import { Fragment, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';

// Modals
import NodeFormModal from '@src/modals/NodeFormModal';
import GitHubFormModal from '@src/modals/GitHubFormModal';
import GoogleDriveFormModal from '@src/modals/GoogleDriveFormModal';
import UploadCheckpointModal from '@src/modals/UploadCheckpointModal';
import DNAModelUploadModal from '@src/modals/DNAModelUploadModal';
import DroneChallengeModal from '@src/modals/DroneChallengeModal';
import TrainingToolModal from '@src/modals/TrainingToolModal';
import DeploymentApiCodeModal from '@src/modals/DeploymentApiCodeModal';
import DeploymentLogDownloadModal from '@src/modals/DeploymentLogDownloadModal';
import DeploymentLogDeleteModal from '@src/modals/DeploymentLogDeleteModal';
import EditApiModal from '@src/modals/EditApiModal/EditApiModal';
import DeploymentDeleteModal from '@src/modals/DeploymentDeleteModal';
import BenchmarkNodeRecordModal from '@src/modals/BenchmarkNodeRecordModal';
import BenchmarkStorageRecordModal from '@src/modals/BenchmarkStorageRecordModal';
import ServingGroupModal from '@src/modals/ServingGroupModal';
import ServingDeleteModal from '@src/modals/ServingDeleteModal/ServingDeleteModal';
import NetworkGroupSettingModal from '@src/modals/NetworkGroupSettingModal';
import ToolPasswordChangeModal from '@src/modals/ToolPasswordChangeModal';
import {
  WorkspaceFormModalContainer,
  TrainingFormModalContainer,
  DeploymentFormModalContainer,
  BuiltinModelFormModalContainer,
  UserFormModalContainer,
  DockerImageFormModalContainer,
  DockerImageDeleteModalContainer,
  JobCreateFormModalContainer,
  JobLogModalContainer,
  HpsLogModalContainer,
  DatasetFormModalContainer,
  FolderFormModalContainer,
  FileFormModalContainer,
  JsonViewModalContainer,
  PreviewModalContainer,
  CheckpointModalContainer,
  WsDescFormModalContainer,
  GPUSettingFormModalContainer,
  UserGroupFormModalContainer,
  PasswordFormModalContainer,
  DeployWorkerMemoModalContainer,
  SystemLogModalContainer,
  LocalFileFormModalContainer,
  StorageSettingModalContainer,
  TemplateModalContainer,
  DockerImageLogModalContainer,
  HanlimUploadModalContainer,
} from './';
function ModalContainer() {
  const modal = useSelector((state) => state.modal);
  const modalKeys = Object.keys(modal);

  useEffect(() => {
    if (Object.keys(modal).length !== 0) {
      document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    } else {
      document.getElementsByTagName('body')[0].style.overflow = 'auto';
    }
  }, [modal]);
  return (
    <Suspense fallback={null}>
      {modalKeys.map((modalType, idx) => (
        <Fragment key={idx}>
          {/* DeployWorker Modal */}
          {modalType === 'DEPLOY_WORKER_MEMO' && (
            <DeployWorkerMemoModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Workspace Modal */}
          {modalType === 'CREATE_WORKSPACE' && (
            <WorkspaceFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'EDIT_WORKSPACE' && (
            <WorkspaceFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Training Modal */}
          {modalType === 'CREATE_TRAINING' && (
            <TrainingFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'EDIT_TRAINING' && (
            <TrainingFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Deployment Modal */}
          {modalType === 'CREATE_DEPLOYMENT' && (
            <DeploymentFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'EDIT_DEPLOYMENT' && (
            <DeploymentFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'SYSTEM_LOG' && (
            <SystemLogModalContainer data={modal[modalType]} type={modalType} />
          )}
          {/* Built-in Model Modal */}
          {modalType === 'CREATE_BUILTIN_MODEL' && (
            <BuiltinModelFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'EDIT_BUILTIN_MODEL' && (
            <BuiltinModelFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Storage Modal */}
          {modalType === 'SETTING_STORAGE' && (
            <StorageSettingModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Node Modal */}
          {modalType === 'ADD_NODE' && (
            <NodeFormModal data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'EDIT_NODE' && (
            <NodeFormModal data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'ADD_STORAGE_NODE' && (
            <NodeFormModal data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'EDIT_STORAGE_NODE' && (
            <NodeFormModal data={modal[modalType]} type={modalType} />
          )}
          {/* User Modal */}
          {modalType === 'CREATE_USER' && (
            <UserFormModalContainer data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'EDIT_USER' && (
            <UserFormModalContainer data={modal[modalType]} type={modalType} />
          )}
          {/* DockerImage Modal */}
          {modalType === 'CREATE_DOCKER_IMAGE' && (
            <DockerImageFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'DELETE_DOCKER_IMAGE' && (
            <DockerImageDeleteModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'EDIT_DOCKER_IMAGE' && (
            <DockerImageFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'DUPLICATE_DOCKER_IMAGE' && (
            <DockerImageFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Job Modal */}
          {modalType === 'CREATE_JOB' && (
            <JobCreateFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'CREATE_HPS_GROUP' && (
            <JobCreateFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'ADD_HPS' && (
            <JobCreateFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'JOB_LOG' && (
            <JobLogModalContainer data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'HPS_LOG' && (
            <HpsLogModalContainer data={modal[modalType]} type={modalType} />
          )}
          {/* Dataset Modal */}
          {modalType === 'CREATE_DATASET' && (
            <DatasetFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'EDIT_DATASET' && (
            <DatasetFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Dataset File Upload Modal */}
          {modalType === 'UPLOAD_FILE' && (
            <LocalFileFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Dataset Folder Modal */}
          {modalType === 'CREATE_FOLDER' && (
            <FolderFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'EDIT_FOLDER' && (
            <FolderFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Dataset File Update Modal */}
          {modalType === 'EDIT_FILE' && (
            <FileFormModalContainer data={modal[modalType]} type={modalType} />
          )}
          {/* Dataset GitHub Clone Modal */}
          {modalType === 'CLONE_GITHUB' && (
            <GitHubFormModal data={modal[modalType]} type={modalType} />
          )}
          {/* Dataset Google Drive Upload Modal */}
          {modalType === 'UPLOAD_GOOGLE_DRIVE' && (
            <GoogleDriveFormModal data={modal[modalType]} type={modalType} />
          )}
          {/* Dataset Hanlim DB Upload Modal */}
          {modalType === 'UPLOAD_HANLIM' && (
            <HanlimUploadModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}

          {/* Json View Modal */}
          {modalType === 'SHOW_JSON' && (
            <JsonViewModalContainer data={modal[modalType]} type={modalType} />
          )}
          {/* Preview Modal */}
          {modalType === 'PREVIEW' && (
            <PreviewModalContainer data={modal[modalType]} type={modalType} />
          )}
          {/* Checkpoint Modal */}
          {modalType === 'CHECKPOINT' && (
            <CheckpointModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Workspace Edit Desc Modal */}
          {modalType === 'EDIT_WS_DESC' && (
            <WsDescFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Workspace Edit Desc Modal */}
          {modalType === 'EDIT_GPU_SETTING' && (
            <GPUSettingFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* User Group Modal */}
          {modalType === 'CREATE_USER_GROUP' && (
            <UserGroupFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'EDIT_USER_GROUP' && (
            <UserGroupFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* User Password Modal */}
          {modalType === 'CHANGE_PASSWORD' && (
            <PasswordFormModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Upload Checkpoint Modal */}
          {modalType === 'UPLOAD_CHECKPOINT' && (
            <UploadCheckpointModal data={modal[modalType]} type={modalType} />
          )}
          {/* DNA Model Upload Modal */}
          {modalType === 'UPLOAD_DNA_MODEL' && (
            <DNAModelUploadModal data={modal[modalType]} type={modalType} />
          )}
          {/* DNA+DRONE Challenge Modal */}
          {modalType === 'DRONE_CHALLENGE' && (
            <DroneChallengeModal data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'EDIT_TRAINING_TOOL' && (
            <TrainingToolModal data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'CREATE_TRAINING_TOOL' && (
            <TrainingToolModal data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'CREATE_DEPLOYMENT_API' && (
            <DeploymentApiCodeModal data={modal[modalType]} type={modalType} />
          )}
          {/* Deployment Log Download Modal */}
          {modalType === 'DEPLOYMENT_LOG_DOWNLOAD' && (
            <DeploymentLogDownloadModal
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'DEPLOYMENT_DELETE' && (
            <DeploymentDeleteModal data={modal[modalType]} type={modalType} />
          )}
          {/* Deployment Log Delete Modal */}
          {modalType === 'DEPLOYMENT_LOG_DELETE' && (
            <DeploymentLogDeleteModal
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Edit API Modal */}
          {modalType === 'EDIT_API' && (
            <EditApiModal data={modal[modalType]} type={modalType} />
          )}
          {/* Benchmarking node records Modal */}
          {modalType === 'BENCHMARK_NODE_RECORD' && (
            <BenchmarkNodeRecordModal
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {/* Benchmarking storage records Modal */}
          {modalType === 'BENCHMARK_STORAGE_RECORD' && (
            <BenchmarkStorageRecordModal
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'CREATE_NETWORK_GROUP' && (
            <NetworkGroupSettingModal
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'NETWORK_GROUP_SETTING' && (
            <NetworkGroupSettingModal
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'SERVING_CREATE_GROUP' && (
            <ServingGroupModal data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'SERVING_DELETE' && (
            <ServingDeleteModal data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'TEMPLATE_CREATE' && (
            <TemplateModalContainer data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'TEMPLATE_EDIT' && (
            <TemplateModalContainer data={modal[modalType]} type={modalType} />
          )}
          {modalType === 'LOG_DOCKER_IMAGE' && (
            <DockerImageLogModalContainer
              data={modal[modalType]}
              type={modalType}
            />
          )}
          {modalType === 'TOOL_PASSWORD_CHANGE' && (
            <ToolPasswordChangeModal data={modal[modalType]} type={modalType} />
          )}
        </Fragment>
      ))}
    </Suspense>
  );
}

export default ModalContainer;
