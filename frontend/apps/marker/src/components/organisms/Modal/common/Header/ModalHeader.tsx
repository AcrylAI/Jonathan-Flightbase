import styles from './ModalHeader.module.scss';
import classNames from 'classnames/bind';
import { CSSProperties } from 'react';
import { Typo } from '@src/components/atoms';

const cx = classNames.bind(styles);

type ModalHeaderProps = {
  children?: JSX.Element;
  customStyle?: CSSProperties;
  title: string;
  ico?: string;
  onClickIco?: () => void;
};

const ModalHeader = ({
  ico,
  onClickIco,
  children,
  title,
  customStyle,
}: ModalHeaderProps) => {
  return (
    <div className={cx('modal-header-container')} style={customStyle}>
      <div className={cx('header-title')}>
        {ico && (
          <div className={cx('ico')} onClick={onClickIco}>
            <img src={ico} alt='ico' />
          </div>
        )}
        <Typo type='H2'>
          <div className={cx('title')}>{title}</div>
        </Typo>
      </div>
      {children}
    </div>
  );
};
ModalHeader.defaultProps = {
  children: <></>,
  customStyle: {},
  ico: '',
  onClickIco: () => {},
};

export default ModalHeader;
