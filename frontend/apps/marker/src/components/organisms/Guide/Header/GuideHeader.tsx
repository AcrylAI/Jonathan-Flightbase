import styles from './GuideHeader.module.scss';
import classNames from 'classnames/bind';
import { Sypo } from '@src/components/atoms';

const cx = classNames.bind(styles);

type Props = {
  title?: string;
  children?: JSX.Element;
};
const GuideHeader = ({ title, children }: Props) => {
  return (
    <div className={cx('header-container')}>
      {title && (
        <div className={cx('title')}>
          <Sypo type='H4'>{title}</Sypo>
        </div>
      )}
      {children}
    </div>
  );
};
GuideHeader.defaultProps = {
  title: '',
  children: <></>,
};

export default GuideHeader;
