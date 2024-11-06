import { useDispatch } from 'react-redux';

import closeIcon from '@images/icon/ic-close.svg';

import { closeModal } from '@src/store/modules/modal';

// CSS Module
import className from 'classnames/bind';
import style from './RoundModalHeader.module.scss';
const cx = className.bind(style);

function RoundModalHeader({ type, createdRoundName, t }) {
  const dispatch = useDispatch();

  return (
    <div className={cx('modal-header')}>
      <div className={cx('title')}>
        {t('roundCreate.start.label', { number: createdRoundName })}
      </div>
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
export default RoundModalHeader;
