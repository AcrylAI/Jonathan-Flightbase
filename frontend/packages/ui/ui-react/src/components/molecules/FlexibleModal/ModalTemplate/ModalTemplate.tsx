import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import ControlBar from './ControlBar';
import style from './ModalTemplate.module.scss';
import { ModalTemplateArgs } from '../types';
const cx = classNames.bind(style);

function FlexibleModal({
  size,
  theme,
  control,
  content,
  modalKey,
  minimize,
  fullscreen,
  isMinimize,
  isMaximize,
  isFullScreen,
  onClickClose,
  onClickMinimize,
  onClickFullScreen,
}: ModalTemplateArgs) {
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const minimizeRef = useRef<boolean>(false);

  const handleClose = () => {
    if (onClickClose !== undefined) onClickClose(modalKey);
  };
  const handleMinimize = () => {
    if (onClickMinimize !== undefined) onClickMinimize(modalKey);
  };

  const handleFullScreen = () => {
    if (onClickFullScreen !== undefined) onClickFullScreen(modalKey);
  };

  const handleESC = (e: KeyboardEvent) => {
    if (!minimizeRef.current && e.key === 'Escape') handleClose();
  };

  const checkControl = () => {
    if (control === undefined || control === null) return true;
    return control;
  };

  useEffect(() => {
    document.addEventListener('keydown', handleESC);
    return () => document.removeEventListener('keydown', handleESC);
  }, []);

  useEffect(() => {
    if (isMinimize !== undefined) minimizeRef.current = isMinimize;
  }, [isMinimize]);

  return (
    <>
      <div
        className={cx(
          'shadow',
          isMinimize && 'hidden',
          isMaximize && 'visible',
        )}
        ref={containerRef}
      >
        <div
          className={cx(
            size ?? 'lg',
            theme,
            'modal',
            isMinimize && 'hidden',
            isMaximize && 'visible',
            isFullScreen ? 'full-screen' : 'window',
          )}
          ref={modalRef}
        >
          {checkControl() && (
            <div className={cx('modal-control')}>
              <ControlBar
                minimize={minimize ?? false}
                fullscreen={fullscreen ?? false}
                isFullScreen={isFullScreen ?? false}
                onClickClose={() => handleClose()}
                onClickMinimize={() => handleMinimize()}
                onClickFullScreen={() => handleFullScreen()}
              />
            </div>
          )}
          <div className={cx('modal-content')}>{content}</div>
        </div>
      </div>
    </>
  );
}

export default FlexibleModal;
