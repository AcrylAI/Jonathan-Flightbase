// Components
import { UiButtonModels } from '@src/models/ui/modal/UiButtonModels';

// Style
import styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export type OneBtnModalProps = {
  title: string;
  texts: string[];
  btns: UiButtonModels[];
  isSuccess?: boolean;
  subTitle?: string;
};

OneBtnModal.defaultProps = {
  isSuccess: false,
  subTitle: '',
};

function OneBtnModal(props: OneBtnModalProps) {
  return (
    <div className={cx('Modal-wrap')} style={{ display: 'flex' }}>
      <div className={cx('Modal-container')}>
        <div className={cx('title-box')}>
          <p>{props.title}</p>
        </div>
        <div
          className={cx('sub-title-box', {
            success: props.isSuccess,
            fail: !props.isSuccess,
          })}
        >
          <p>{props.subTitle}</p>
        </div>
        <div className={cx('text-box')}>
          {props.texts.map((txt, idx) => (
            <p key={idx}>{txt}</p>
          ))}
        </div>
        <div className={cx('btn-box')}>
          {props.btns.map((btn, idx) => {
            return (
              <div key={idx}>
                <button className={cx(`${btn.type}`)} onClick={btn.onClick}>
                  {btn.text}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default OneBtnModal;
