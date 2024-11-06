import { useSelector } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button } from '@jonathan/ui-react';

// CSS Module
import classNames from 'classnames/bind';
import style from './StopRoundModalContent.module.scss';
const cx = classNames.bind(style);

function StopRoundModalContent({ onCancel, onStop }) {
  const { t } = useTranslation();
  const { theme } = useSelector(({ theme }) => theme);

  return (
    <div className={cx('modal-wrapper')}>
      <h2>{t('round.modal.stopRound.label')}</h2>
      <div className={cx('message')}>{t('round.modal.stopRound.message')}</div>
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
          onClick={onStop}
        >
          {t('round.modal.stop.label')}
        </Button>
      </div>
    </div>
  );
}
export default StopRoundModalContent;
