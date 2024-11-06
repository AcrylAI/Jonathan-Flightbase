import { useSelector } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button } from '@jonathan/ui-react';

// CSS Module
import classNames from 'classnames/bind';
import style from './DeleteRoundModalContent.module.scss';
const cx = classNames.bind(style);

function DeleteRoundModalContent({ onCancel, onDelete }) {
  const { t } = useTranslation();
  const { theme } = useSelector(({ theme }) => theme);

  return (
    <div className={cx('modal-wrapper')}>
      <h2>{t('round.modal.delete.label')}</h2>
      <div className={cx('message')}>
        {t('round.modal.deleteRound.message')}
      </div>
      <div className={cx('footer')}>
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
          {t('round.modal.cancel.label')}
        </Button>
        <Button
          type='red'
          theme={theme}
          customStyle={{
            width: '72px',
            height: '32px',
          }}
          onClick={onDelete}
        >
          {t('round.table.delete.label')}
        </Button>
      </div>
    </div>
  );
}
export default DeleteRoundModalContent;
