// Components
import DataInputForm from './DataInputForm';

const LocalFileFormModalContent = ({
  files,
  folders,
  filesError,
  uploadTypeOptions,
  uploadType,
  fileInputHandler,
  folderInputHandler,
  radioBtnHandler,
  onRemoveFiles,
  onRemoveFolder,
}) => {
  return (
    <DataInputForm
      files={files}
      folders={folders}
      filesError={filesError}
      uploadTypeOptions={uploadTypeOptions}
      uploadType={uploadType}
      fileInputHandler={fileInputHandler}
      folderInputHandler={folderInputHandler}
      radioBtnHandler={radioBtnHandler}
      onRemoveFiles={onRemoveFiles}
      onRemoveFolder={onRemoveFolder}
    />
  );
};

export default LocalFileFormModalContent;
