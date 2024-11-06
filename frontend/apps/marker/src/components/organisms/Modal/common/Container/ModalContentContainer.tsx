import styles from './ModalContentContainer.module.scss';
import classNames from 'classnames/bind';
import { CSSProperties } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import useModal from '@src/hooks/Modal/useModal';
const cx = classNames.bind(styles);
type ModalContentContainerProps = {
  children?: JSX.Element;
  customStyle?: CSSProperties;
  scroll?: 'bottom' | 'top' | 'none';
  confirm?: boolean;
};

const ModalContentContainer = ({
  scroll,
  children,
  customStyle,
  confirm,
}: ModalContentContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const scrollHandler = () => {
    if (ref.current) {
      let value = 0;
      if (scroll === 'bottom') value = 9999;
      if (scroll !== 'none') ref.current.scrollTop = value;
    }
  };

  useEffect(() => {
    scrollHandler();
  }, [scroll]);
  return (
    <div
      ref={ref}
      style={{
        ...customStyle,
        height: confirm ? '100%' : '574px',
        alignItems: 'stretch',
        flexGrow: 1,
      }}
      className={cx('content-container')}
    >
      {children}
    </div>
  );
};

ModalContentContainer.defaultProps = {
  children: <></>,
  customStyle: {},
  scroll: 'none',
  confirm: false,
};

export default ModalContentContainer;
