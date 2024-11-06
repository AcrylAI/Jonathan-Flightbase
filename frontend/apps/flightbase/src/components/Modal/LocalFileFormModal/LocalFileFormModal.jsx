// i18n
import { withTranslation } from 'react-i18next';

// Atom
import { Modal } from '@jonathan/ui-react';

const LocalFileModal = (prop) => {
  const { headerRender, contentRender, footerRender, cancel, submit } =
    prop.data;
  const {
    fileInputHandler,
    files,
    folderInputHandler,
    folders,
    isValidate,
    onRemoveFiles,
    onRemoveFolder,
    onSubmit,
    radioBtnHandler,
    uploadTypeOptions,
    uploadType,
    type,
  } = prop;
  const newSubmit = {
    text: submit.text,
    func: async () => {
      const res = await onSubmit(submit.func);
      return res;
    },
  };
  const modalContentsStyle = {
    headerStyle: {
      padding: '32px 48px 20px',
      margin: 0,
    },
    contentStyle: {
      padding: '24px 48px',
    },
    footerStyle: {
      padding: '24px 48px',
    },
  };
  const props = {
    headerProps: {},
    contentProps: {
      fileInputHandler,
      files,
      folderInputHandler,
      folders,
      isValidate,
      onRemoveFiles,
      onRemoveFolder,
      onSubmit,
      radioBtnHandler,
      uploadTypeOptions,
      uploadType,
    },
    footerProps: { cancel, submit: newSubmit, isValidate, type },
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
      topAnimation='calc(50% - 300px)'
    />
  );
};

export default withTranslation()(LocalFileModal);
