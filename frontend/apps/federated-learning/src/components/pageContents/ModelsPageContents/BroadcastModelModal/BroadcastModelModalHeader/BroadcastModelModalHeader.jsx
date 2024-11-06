import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Icons
import closeIcon from '@images/icon/ic-close.svg';

import { closeModal } from '@src/store/modules/modal';

// CSS Module
import className from 'classnames/bind';
import style from './BroadcastModelModalHeader.module.scss';
const cx = className.bind(style);

function BroadcastModelModalHeader({ type }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <div className={cx('modal-header')}>
      <div className={cx('title')}>{t('model.modal.broadcastModel.label')}</div>
      <img
        className={cx('close')}
        src={closeIcon}
        alt='close'
        onClick={() => {
          dispatch(closeModal(type));
        }}
      />
    </div>
  );
}

export default BroadcastModelModalHeader;
