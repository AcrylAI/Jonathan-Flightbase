// i18n
import { withTranslation } from 'react-i18next';

// Atom
import { Modal } from '@jonathan/ui-react';

const DatasetFormModal = ({
  validate,
  data,
  type,
  name,
  nameError,
  description,
  descriptionError,
  accessTypeOptions,
  accessType,
  uploadMethodOptions,
  uploadMethod,
  uploadDataTypeOptions,
  uploadDataType,
  textInputHandler,
  workspaceOptions,
  selectedWorkspace,
  selectInputHandler,
  radioBtnHandler,
  onSubmit,
  selectTemplate,
  defaultTemplate,
  datasetTemplateList,
  datasetTemplate,
  templateFileFolderHandler,
  googleDriveHandler,
  googleAccessTokenHandler,
  builtInModelNamesHandler,
  builtInModelIdHandler,
  droneBm,
  droneStartDate,
  droneEndDate,
  droneArea,
  droneAreaError,
  droneAccess,
  timeRangeHandler,
  droneOptionHandler,
  progressRefs,
  builtInTemplate,
  builtInModelTemplateOptions,
  t,
}) => {
  const {
    submit,
    cancel,
    workspaceId,
    headerRender,
    contentRender,
    footerRender,
    templateData,
    selectedOption,
  } = data;
  const newSubmit = {
    text: submit.text,
    func: async () => {
      const res = await onSubmit(submit.func);
      return res;
    },
  };

  const props = {
    headerProps: { type, t },
    contentProps: {
      workspaceId,
      type,
      name,
      textInputHandler,
      nameError,
      description,
      workspaceOptions,
      selectedWorkspace,
      selectInputHandler,
      uploadMethodOptions,
      uploadMethod,
      uploadDataTypeOptions,
      uploadDataType,
      onSubmit,
      selectTemplate,
      defaultTemplate,
      datasetTemplateList,
      datasetTemplate,
      templateFileFolderHandler,
      progressRefs,
      accessTypeOptions,
      accessType,
      radioBtnHandler,
      googleDriveHandler,
      googleAccessTokenHandler,
      builtInModelNamesHandler,
      builtInModelIdHandler,
      descriptionError,
      droneBm,
      droneStartDate,
      droneEndDate,
      timeRangeHandler,
      droneArea,
      droneAreaError,
      droneAccess,
      droneOptionHandler,
      builtInTemplate,
      builtInModelTemplateOptions,
      templateData,
      selectedOption,
      t,
    },
    footerProps: {
      submit: newSubmit,
      submitBtnTestId: 'dataset-create-btn',
      cancel,
      type,
      validate,
      t,
    },
  };

  const modalContentsStyle = {
    headerStyle: {
      padding: '32px 48px 20px 44px',
      fontSize: '20px',
      fontFamily: 'SpoqaB',
    },
    contentStyle: {
      maxHeight: '65vh',
      minHeight: '200px',
      padding: '24px 48px 24px 44px',
    },
    footerStyle: {
      padding: '24px 48px 24px 44px',
    },
  };

  return (
    <Modal
      HeaderRender={headerRender}
      ContentRender={contentRender}
      FooterRender={footerRender}
      headerProps={props.headerProps}
      contentProps={props.contentProps}
      footerProps={props.footerProps}
      headerStyle={modalContentsStyle.headerStyle}
      contentStyle={modalContentsStyle.contentStyle}
      footerStyle={modalContentsStyle.footerStyle}
      topAnimation='calc(50% - 365px)'
    />
  );
};

export default withTranslation()(DatasetFormModal);
