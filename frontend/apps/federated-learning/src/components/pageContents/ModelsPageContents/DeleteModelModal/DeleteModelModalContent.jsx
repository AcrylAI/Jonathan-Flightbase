import { useSelector } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button } from '@jonathan/ui-react';

// CSS Module
import classNames from 'classnames/bind';
import style from './DeleteModelModalContent.module.scss';
const cx = classNames.bind(style);

function DeleteModelModalContent({ version, onCancel, onDelete }) {
  const { t } = useTranslation();
  const { theme } = useSelector(({ theme }) => theme);

  return (
    <div className={cx('modal-wrapper')}>
      <h2>{t('model.modal.deleteModel.label')}</h2>
      <div className={cx('message')}>
        {t('model.modal.deleteModel.message', { version })}
      </div>
      <div className={cx('footer')}>
        <div>
          <Button
            type='none-border'
            theme={theme}
            customStyle={{
              width: '72px',
              height: '32px',
              marginRight: '12px',
            }}
            onClick={onCancel}
          >
            {t('model.modal.cancel.label')}
          </Button>
        </div>
        <Button
          type='red'
          theme={theme}
          customStyle={{
            width: '72px',
            height: '32px',
          }}
          onClick={() => onDelete(version)}
        >
          {t('model.modal.delete.label')}
        </Button>
      </div>
    </div>
  );
}

export default DeleteModelModalContent;
