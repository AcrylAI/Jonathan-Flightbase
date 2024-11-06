import { useEffect, useRef, useState } from 'react';
import { ModalTemplateArgs } from '../../../types';
import styles from './ModalUnderBarItem.module.scss';
import classnames from 'classnames/bind';
import maximizeIcon from '@src/static/images/icons/ic-maximize-modal.svg';
import closeIcon from '@src/static/images/icons/ic-close-modal.svg';
const cx = classnames.bind(styles);

type ModalUnderBarItemProps = {
  modal: ModalTemplateArgs;
};

export default function ModalUnderBarItem({ modal }: ModalUnderBarItemProps) {
  const { onClickClose, onClickMaximize } = modal;
  const handleClose = () => {
    onClickClose(modal.modalKey);
  };

  const handleMaximize = () => {
    if (onClickMaximize !== undefined) onClickMaximize(modal.modalKey);
  };

  const handleDoubleClick = () => {
    if (onClickMaximize !== undefined) onClickMaximize(modal.modalKey);
  };

  return (
    <div
      className={cx('underbar-item')}
      onDoubleClick={() => {
        handleDoubleClick();
      }}
    >
      <div className={cx('modal-title')}>{modal.title ?? modal.modalKey}</div>
      <div className={cx('control-icons')}>
        <div className={cx('maximize')}>
          <img
            onClick={() => {
              handleMaximize();
            }}
            src={maximizeIcon}
            alt='최대화'
          />
        </div>
        <div className={cx('close')}>
          <img src={closeIcon} alt='닫기' onClick={() => handleClose()} />
        </div>
      </div>
    </div>
  );
}
