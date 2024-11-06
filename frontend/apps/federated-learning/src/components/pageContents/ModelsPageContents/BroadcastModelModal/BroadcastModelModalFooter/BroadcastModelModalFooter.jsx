// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button } from '@jonathan/ui-react';

// CSS Module
import className from 'classnames/bind';
import style from './BroadcastModelModalFooter.module.scss';
const cx = className.bind(style);

function BroadcastModelModalFooter({ onSubmit, validate }) {
  const { t } = useTranslation();
  return (
    <div className={cx('modal-footer')}>
      <Button
        type='primary'
        theme='jp-dark'
        onClick={onSubmit}
        disabled={!validate}
      >
        {t('model.modal.send.label')}
      </Button>
    </div>
  );
}

export default BroadcastModelModalFooter;
