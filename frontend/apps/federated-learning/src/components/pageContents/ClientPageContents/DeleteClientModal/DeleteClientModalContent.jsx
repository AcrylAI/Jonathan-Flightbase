import { useSelector } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// ui-react
import { Button } from '@jonathan/ui-react';

// CSS Module
import classNames from 'classnames/bind';
import style from './DeleteClientModalContent.module.scss';
const cx = classNames.bind(style);

function DeleteClientModalContent({ onCancel, onDelete, name }) {
  const { t } = useTranslation();
  const { theme } = useSelector(({ theme }) => theme);

  return (
    <div className={cx('modal-wrapper')}>
      <h2>{t('clients.modal.delete')}</h2>
      <div className={cx('message')}>
        {t('clients.modal.deleteAlert.label', { name })}
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
            {t('cancel.label')}
          </Button>
        </div>
        <Button
          type='red'
          theme={theme}
          customStyle={{
            width: '72px',
            height: '32px',
          }}
          onClick={() => onDelete(name)}
        >
          {t('delete.label')}
        </Button>
      </div>
    </div>
  );
}

export default DeleteClientModalContent;
