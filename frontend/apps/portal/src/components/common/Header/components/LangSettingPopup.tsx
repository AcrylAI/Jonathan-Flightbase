import React, { useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

// CSS Module
import classNames from 'classnames/bind';
import style from './LangSettingPopup.module.scss';

const cx = classNames.bind(style);

export type LangSettingPopupProps = {
  children: JSX.Element;
  popupHandler: () => void;
};
function Popup({ children, popupHandler }: LangSettingPopupProps) {
  const popup = useRef(null);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      // eslint-disable-next-line react/no-find-dom-node
      if (!ReactDOM.findDOMNode(popup.current)?.contains(e.target as Node)) {
        if (popupHandler) popupHandler();
      }
    },
    [popupHandler],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClick, false);
    return () => {
      document.removeEventListener('mousedown', handleClick, false);
    };
  }, [handleClick]);

  return (
    <div className={cx('popup-container')} ref={popup}>
      {children}
    </div>
  );
}

export default Popup;
