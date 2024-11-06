import { useRef, useEffect } from 'react';

// types
import { Properties as CSSProperties } from 'csstype';
import { theme } from '@src/utils';

// CSS module
import classNames from 'classnames/bind';
import style from './Modal.module.scss';
const cx = classNames.bind(style);

type Props = {
  HeaderRender?: () => JSX.Element;
  ContentRender?: () => JSX.Element;
  FooterRender?: () => JSX.Element;
  headerProps?: any;
  footerProps?: any;
  contentProps?: any;
  windowStyle?: CSSProperties;
  headerStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  footerStyle?: CSSProperties;
  topAnimation?: string;
  theme?: ThemeType;
};

function Modal({
  HeaderRender,
  ContentRender,
  FooterRender,
  headerProps,
  footerProps,
  contentProps,
  windowStyle,
  headerStyle,
  contentStyle,
  footerStyle,
  topAnimation,
  theme,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current: modalEle } = modalRef;
    // 애니메이션
    setTimeout(() => {
      if (modalEle) {
        modalEle.style.top = topAnimation || '0';
        modalEle.style.opacity = '1';
      }
    }, 1);
    return () => {
      if (modalEle) {
        modalEle.style.top = '0';
        modalEle.style.opacity = '0';
      }
    };
  }, [topAnimation]);

  return (
    <div className={cx('shadow')}>
      <div className={cx('modal', theme)} ref={modalRef} style={windowStyle}>
        {HeaderRender && (
          <div className={cx('modal-header')} style={headerStyle}>
            <HeaderRender {...headerProps} />
          </div>
        )}
        {ContentRender && (
          <div className={cx('modal-content')} style={contentStyle}>
            <ContentRender {...contentProps} />
          </div>
        )}
        {FooterRender && (
          <div className={cx('modal-footer')} style={footerStyle}>
            <FooterRender {...footerProps} />
          </div>
        )}
      </div>
    </div>
  );
}

Modal.defaultProps = {
  HeaderRender: undefined,
  ContentRender: undefined,
  FooterRender: undefined,
  headerProps: undefined,
  footerProps: undefined,
  contentProps: undefined,
  windowStyle: undefined,
  headerStyle: undefined,
  contentStyle: undefined,
  footerStyle: undefined,
  topAnimation: '0',
  theme: theme.PRIMARY_THEME,
};

export default Modal;
