import { ModalButtonsArgs } from '../types';
import classnames from 'classnames/bind';
import styles from './ModalButtons.module.scss';
import Button from '@src/components/atoms/button/Button';

const cx = classnames.bind(styles);

export default function ModalButtons({
  okButton,
  cancelButton,
  nextButton,
  prevButton,
}: ModalButtonsArgs) {
  const handlePrev = () => {
    if (prevButton && prevButton.onClick !== undefined) prevButton.onClick();
  };
  const handleNext = () => {
    if (nextButton && nextButton.onClick !== undefined) nextButton.onClick();
  };
  const handleOk = () => {
    if (okButton && okButton.onClick !== undefined) okButton.onClick();
  };
  const handleCancel = () => {
    if (cancelButton && cancelButton.onClick !== undefined)
      cancelButton.onClick();
  };
  return (
    <div className={cx('btns-container')}>
      <div className={cx('left-side')}>
        {prevButton && (
          <div className={cx('prev-btn')}>
            <Button
              disabled={
                prevButton.disabled !== undefined && prevButton.disabled
              }
              onClick={() => {
                handlePrev();
              }}
            >
              {prevButton.title}
            </Button>
          </div>
        )}
        {nextButton && (
          <div className={cx('next-btn')}>
            <Button
              disabled={
                nextButton.disabled !== undefined && nextButton.disabled
              }
              onClick={() => {
                handleNext();
              }}
            >
              {nextButton.title}
            </Button>
          </div>
        )}
      </div>
      <div className={cx('right-side')}>
        {cancelButton && (
          <div className={cx('cancel-btn')}>
            <Button
              type='primary-light'
              disabled={
                cancelButton.disabled !== undefined && cancelButton.disabled
              }
              onClick={() => {
                handleCancel();
              }}
            >
              {cancelButton.title}
            </Button>
          </div>
        )}
        {okButton && (
          <div className={cx('ok-btn')}>
            <Button
              disabled={okButton.disabled !== undefined && okButton.disabled}
              onClick={() => {
                handleOk();
              }}
            >
              {okButton.title}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
