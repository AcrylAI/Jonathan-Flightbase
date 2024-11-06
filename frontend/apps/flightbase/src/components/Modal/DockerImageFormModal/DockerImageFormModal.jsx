// i18n
import { withTranslation } from 'react-i18next';

// Atom
import { Modal } from '@jonathan/ui-react';
import useComponentExistObserver from '@src/hooks/useComponentExistObserver';

const DockerImageFormModal = ({
  validate,
  data,
  type,
  imageName,
  imageNameError,
  imageDesc,
  imageDescError,
  dockerUrl,
  dockerUrlError,
  dockerTag,
  dockerTagError,
  dockerTagOptions,
  dockerNGC,
  dockerNGCError,
  dockerNGCOptions,
  dockerNGCVersion,
  dockerNGCVersionError,
  dockerNGCVersionOptions,
  uploadTypeOptions,
  uploadType,
  files,
  filesError,
  releaseTypeOptions,
  releaseType,
  textInputHandler,
  multiSelectHandler,
  wsList,
  prevSelectedWsList,
  selectedWsListError,
  fileInputHandler,
  selectInputHandler,
  radioBtnHandler,
  progressRef,
  onSubmit,
  onRemove,
  commitComment,
  commitCommentError,
  isCommit,
  t,
}) => {
  const { submit, cancel, headerRender, contentRender, footerRender } = data;
  const [setRef] = useComponentExistObserver();
  const newSubmit = {
    text: submit.text,
    func: async () => {
      const res = await onSubmit(submit.func);
      return res;
    },
  };

  const props = {
    headerProps: {
      type,
      t,
    },
    contentProps: {
      type,
      imageName,
      imageNameError,
      imageDesc,
      imageDescError,
      dockerUrl,
      dockerUrlError,
      dockerTag,
      dockerTagError,
      dockerTagOptions,
      dockerNGC,
      dockerNGCError,
      dockerNGCOptions,
      dockerNGCVersion,
      dockerNGCVersionError,
      dockerNGCVersionOptions,
      uploadTypeOptions,
      uploadType,
      files,
      filesError,
      releaseTypeOptions,
      releaseType,
      textInputHandler,
      multiSelectHandler,
      wsList,
      prevSelectedWsList,
      selectedWsListError,
      fileInputHandler,
      selectInputHandler,
      radioBtnHandler,
      progressRef,
      onRemove,
      commitComment,
      commitCommentError,
      isCommit,
      setRef,
    },
    footerProps: {
      submit: newSubmit,
      submitBtnTestId: 'dockerimage-upload-btn',
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
      padding: '24px 44px 24px 44px',
    },
    footerStyle: {
      padding: '24px 44px 24px 44px',
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

export default withTranslation()(DockerImageFormModal);
