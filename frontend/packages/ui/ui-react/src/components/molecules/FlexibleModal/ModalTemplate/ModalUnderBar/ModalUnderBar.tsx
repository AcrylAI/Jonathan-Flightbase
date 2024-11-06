import { Fragment, useEffect, useRef, useState } from 'react';
import { ModalRenderProps } from '../ModalRender/ModalRender';
import styles from './ModalUnderBar.module.scss';
import classnames from 'classnames/bind';
import ModalUnderBarItem from './UnderBarItem/ModalUnderBarItem';

const cx = classnames.bind(styles);
export default function ModalUnderBar({ modalList }: ModalRenderProps) {
  return (
    <div className={cx('underbar-container')}>
      {modalList.map((modal, idx) => {
        if (modal.isMinimize) {
          return (
            <ModalUnderBarItem
              key={`modal-under-item ${modal.modalKey}${idx}`}
              modal={modal}
            />
          );
        }
        return (
          <Fragment key={`modal-under-item ${modal.modalKey}${idx}`}></Fragment>
        );
      })}
    </div>
  );
}
