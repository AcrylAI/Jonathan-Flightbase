import styles from './ModalLabel.module.scss';
import classNames from 'classnames/bind';
import { Sypo } from '@src/components/atoms';
import { MONO204 } from '@src/utils/color';
const cx = classNames.bind(styles);

type ModalLabelProps = {
  title: string;
  desc?: string;
  badge?: JSX.Element;
  subTitle?: string;
  required?: boolean;
  children?: JSX.Element;
  customStyle?: React.CSSProperties;
  customLabelStyle?: React.CSSProperties;
  customSubLabelStyle?: React.CSSProperties;
};
const ModalLabel = ({
  desc,
  badge,
  title,
  subTitle,
  required,
  children,
  customStyle,
  customLabelStyle,
  customSubLabelStyle,
}: ModalLabelProps) => {
  return (
    <div style={customStyle} className={cx('modal-label-container')}>
      <div className={cx('title-wrapper')}>
        <div style={customLabelStyle} className={cx('title')}>
          <Sypo type='H4' weight='B'>
            {title}
            {required && <span className={cx('required')}>*</span>}
          </Sypo>
          {badge}
          <Sypo type='P1' weight='regular' color={MONO204}>
            <span className={cx('desc')}>{desc}</span>
          </Sypo>
        </div>
        <div style={customSubLabelStyle} className={cx('sub-title')}>
          <Sypo type='P1' color={MONO204} weight='regular'>
            {subTitle}
          </Sypo>
        </div>
      </div>
      <div className={cx('children')}>{children}</div>
    </div>
  );
};

ModalLabel.defaultProps = {
  subTitle: '',
  desc: '',
  badge: <></>,
  required: false,
  children: <></>,
  customStyle: {},
  customLabelStyle: {},
  customSubLabelStyle: {},
};
export default ModalLabel;
