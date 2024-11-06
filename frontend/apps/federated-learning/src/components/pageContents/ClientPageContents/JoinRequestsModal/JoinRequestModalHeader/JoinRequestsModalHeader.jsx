import React from 'react';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// module
import { closeModal } from '@src/store/modules/modal';

// CSS Module
import classNames from 'classnames/bind';
import style from './JoinRequestModalHeader.module.scss';
const cx = classNames.bind(style);

function JoinRequestModalHeader({ type }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <>
      <div className={cx('modal-header')}>
        <span>
          {t('join.label')} {t('request.label')}
        </span>
        <div
          className={cx('close')}
          onClick={() => {
            dispatch(closeModal(type));
          }}
        ></div>
      </div>
      <div className={cx('line')}></div>
    </>
  );
}

export default JoinRequestModalHeader;
