import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// i18n
import i18next from 'i18next';

// Icons
import korIcon from '@images/icon/Korea.svg';
import engIcon from '@images/icon/USA.svg';

// CSS Module
import classNames from 'classnames/bind';
import style from './SideNavFooter.module.scss';
const cx = classNames.bind(style);

function SideNavFooter() {
  const popup = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const selected = i18next.language;

  const popupHandler = () => {
    setIsOpen(!isOpen);
  };

  // 언어 변경
  const changeLanguage = (lng) => {
    window.localStorage.setItem('language', lng);
    popupHandler();
    i18next.changeLanguage(lng);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        (popup.current &&
          !ReactDOM.findDOMNode(popup.current).contains(e.target)) ||
        isOpen
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClick, false);
    return () => {
      document.removeEventListener('click', handleClick, false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup]);

  return (
    <>
      <div
        className={cx('select-lang')}
        onClick={() => {
          setIsOpen(true);
        }}
        ref={popup}
      >
        <label className={cx(isOpen && 'active')}>Language</label>
      </div>
      {isOpen && (
        <>
          <div className={cx('tooltip')}>
            <div
              className={cx('lang', selected === 'ko' && 'selected')}
              onClick={() => {
                changeLanguage('ko');
              }}
            >
              <img src={korIcon} alt='korean' />
              <label>한국어</label>
              {selected === 'ko' && <div className={cx('point', 'ko')}></div>}
            </div>
            <div
              className={cx('lang', selected === 'en' && 'selected')}
              onClick={() => {
                changeLanguage('en');
              }}
            >
              <img src={engIcon} alt='english' />
              <label>ENGLISH</label>
              {selected === 'en' && <div className={cx('point', 'en')}></div>}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SideNavFooter;
