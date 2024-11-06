import { useEffect } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import ModalFrame from '../ModalFrame';
import InputBoxWithLabel from '@src/components/molecules/InputBoxWithLabel';
import TextInput from '@src/components/atoms/input/TextInput';

// CSS module
import classNames from 'classnames/bind';
import style from './FolderFormModal.module.scss';
const cx = classNames.bind(style);

function FolderFormModal({
  validate,
  data,
  type,
  folderName,
  folderNameError,
  textInputHandler,
  onSubmit,
  datasetName,
  loc,
}) {
  const { t } = useTranslation();
  const { submit, cancel } = data;
  const newSubmit = {
    text: submit.text,
    func: async () => {
      const res = await onSubmit(submit.func);
      return res;
    },
  };

  useEffect(() => {
    const listener = (e) => {
      if (validate && (e.key === 'Enter' || e.key === 'NumpadEnter')) {
        if (submit.func) {
          onSubmit(submit.func);
        }
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [validate, onSubmit, submit]);

  return (
    <ModalFrame
      submit={newSubmit}
      cancel={cancel}
      type={type}
      validate={validate}
    >
      <h2 className={cx('title')}>
        {type === 'CREATE_FOLDER'
          ? t('createFolderForm.title.label')
          : t('editFolderForm.title.label')}
      </h2>
      <div className={cx('form')}>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('folderName.label')}
            errorMsg={t(folderNameError)}
            labelSize='large'
          >
            <InputBoxWithLabel
              labelText={`/${datasetName}${loc}`}
              leftLabel
              bgBox
            >
              <TextInput
                label={t('folderName.label')}
                placeholder={t('folderName.placeholder')}
                value={folderName}
                name='folderName'
                onChange={textInputHandler}
                status={
                  folderNameError === null
                    ? ''
                    : folderNameError === ''
                    ? 'success'
                    : 'error'
                }
                maxLength={50}
                autoFocus={true}
              />
            </InputBoxWithLabel>
          </InputBoxWithLabel>
        </div>
      </div>
    </ModalFrame>
  );
}

export default FolderFormModal;
