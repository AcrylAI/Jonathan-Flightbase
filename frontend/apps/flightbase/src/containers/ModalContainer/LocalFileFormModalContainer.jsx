import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDispatch } from 'react-redux';
import { sliceUploader } from '@src/fileUpload';

// Actions
import {
  addUploadInstance,
  deleteLastUploadInstance,
  openUploadList,
} from '@src/store/modules/upload';

// Network
import { upload } from '@src/network';

// Components
import { toast } from '@src/components/Toast';
import LocalFileFormModal from '@src/components/Modal/LocalFileFormModal';

function LocalFileFormModalContainer(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Component State
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [filesError, setFilesError] = useState();
  const [uploadType, setUploadType] = useState(0);
  const uploadTypeOptions = [
    { label: 'file.label', value: 0 },
    { label: 'folder.label', value: 1 },
  ];

  // 유효성 검증
  const checkValidate = (name, value) => {
    if (name === 'files') {
      if (value.length === 0) {
        return 'file.empty.message';
      }
      const fileNameErrorList = [];
      const fileReg = /(?=.*[:?*<>#$%&()"|\\\s])/;
      for (let i = 0; i < value.length; i += 1) {
        const { name: fileName } = value[i];
        if (fileName.match(fileReg)) {
          fileNameErrorList.push(fileName);
        }
      }
      if (fileNameErrorList.length > 0) {
        toast.info(
          t('fileNameChange.message', {
            fileNameList: `${fileNameErrorList.join('\n')}`,
          }),
        );
      }
    }
    return null;
  };

  // 인풋 파일 이벤트 핸들러
  const fileInputHandler = (newFiles) => {
    const prevFiles = files;
    const fileList = [...prevFiles, ...newFiles];
    setFiles(fileList);
    const validate = checkValidate('files', fileList);
    if (validate) {
      setFilesError(validate);
    } else {
      setFilesError('');
    }
  };

  // 인풋 파일(폴더) 이벤트 핸들러
  const folderInputHandler = (newFiles) => {
    const prevFiles = files;
    const fileList = [...prevFiles, ...newFiles];
    const folderNameList = [];
    for (let i = 0; i < fileList.length; i += 1) {
      const { webkitRelativePath } = fileList[i];
      const folderName = webkitRelativePath.split('/')[0];
      // eslint-disable-next-line no-continue
      if (folderNameList.indexOf(folderName) > -1) continue;

      folderNameList.push(folderName);
    }
    setFiles(fileList);
    setFolders(folderNameList);

    const validate = checkValidate('files', fileList);
    if (validate) {
      setFilesError(validate);
    } else {
      setFilesError('');
    }
  };

  // 라디오 버튼 이벤트 핸들러
  const radioBtnHandler = (e) => {
    const { value } = e.target;
    // 이 모달에서 name은 항상 uploadType
    setUploadType(parseInt(value, 10)); // 파일(0) or 폴더(1)
    setFiles([]);
    setFolders([]);
    setFilesError(null);
  };

  // 인풋 파일 삭제 이벤트 핸들러
  const onRemoveFiles = (idx) => {
    const newFiles = [
      ...files.slice(0, idx),
      ...files.slice(idx + 1, files.length),
    ];
    setFiles(newFiles);

    const validate = checkValidate('files', newFiles);
    if (validate) {
      setFilesError(validate);
    } else {
      setFilesError('');
    }
  };

  // 인풋 폴더 삭제 이벤트 핸들러
  const onRemoveFolder = (name, idx) => {
    const prevFiles = files;
    const newFiles = [];
    for (let i = 0; i < prevFiles.length; i += 1) {
      const file = prevFiles[i];
      const { webkitRelativePath } = prevFiles[i];
      const folderName = webkitRelativePath.split('/')[0];
      if (folderName !== name) {
        newFiles.push(file);
      }
    }

    const newFolders = [
      ...folders.slice(0, idx),
      ...folders.slice(idx + 1, folders.length),
    ];

    const validate = checkValidate('files', newFiles);
    if (validate) {
      setFilesError(validate);
    } else {
      setFilesError('');
    }

    setFiles(newFiles);
    setFolders(newFolders);
  };
  // 분할 업로드
  const splitUpload = (datasetId, form, files, callback) => {
    const uploadInstance = sliceUploader({
      uploadGroupName: form.get('dataset_name'),
      data: files,
      doneFunc: callback,
      uploadRequest: async (s, e, chunk, fileName, fileSize, basePath) => {
        form.set('doc', chunk, basePath ? `${basePath}/${fileName}` : fileName);

        const response = await upload({
          url: `datasets/${datasetId}/files`,
          method: 'put',
          form,
          header: {
            'Content-Range': `bytes ${s}-${e}/${fileSize}`,
          },
        });

        const { status, message } = response;
        if (status === 'STATUS_SUCCESS') {
          return { status: 'STATUS_SUCCESS' };
        }
        toast.error(message);
        return { status: 'STATUS_FAIL', message };
      },
    });

    // 업로드 인스턴스 목록에 추가
    dispatch(addUploadInstance(uploadInstance));

    // 업로드
    const response = uploadInstance.upload();
    if (response) {
      response.then((isUpload) => {
        if (isUpload === false) {
          dispatch(deleteLastUploadInstance());
        }
      });
    }

    // 업로드 목록 모달 열기
    dispatch(openUploadList());
  };

  const onSubmit = async (callback) => {
    const {
      datasetId,
      loc,
      workspaceId,
      workspaceName,
      datasetName,
      fileType,
    } = props.data;
    const form = new FormData();
    form.append('dataset_id', datasetId);
    form.append('path', loc);
    form.append('workspace_id', workspaceId);
    form.append('workspace_name', workspaceName);
    form.append('dataset_name', datasetName);
    form.append('type', uploadType);
    if (Number(uploadType === 0)) {
      if (fileType === 'array') {
        files.forEach(({ name: fileName }) =>
          form.append(`upload_list`, fileName),
        );
      } else {
        const fileNameList = files.map(({ name: fileName }) => fileName);
        form.append('upload_list', fileNameList);
      }
    } else if (Number(uploadType) === 1) {
      if (fileType === 'array') {
        folders.forEach((folderName) => form.append(`upload_list`, folderName));
      } else {
        form.append('upload_list', folders);
      }
    }
    splitUpload(datasetId, form, files, callback);
    return true;
  };

  return (
    <LocalFileFormModal
      {...props}
      isValidate={filesError === ''}
      onSubmit={onSubmit}
      fileInputHandler={fileInputHandler}
      folderInputHandler={folderInputHandler}
      radioBtnHandler={radioBtnHandler}
      onRemoveFiles={onRemoveFiles}
      onRemoveFolder={onRemoveFolder}
      files={files}
      folders={folders}
      uploadTypeOptions={uploadTypeOptions}
      uploadType={uploadType}
    />
  );
}
export default LocalFileFormModalContainer;
