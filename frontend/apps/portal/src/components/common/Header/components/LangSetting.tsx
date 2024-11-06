/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { setCookie } from 'cookies-next';

// i18n
import i18n from '@src/common/lang/i18n';

// Components
import Popup from './LangSettingPopup';
import CustomPopupBtn from './CustomPopupBtn';

// Style
import classNames from 'classnames/bind';
import style from './LangSetting.module.scss';
const cx = classNames.bind(style);

// Images
const GlobalIcon = '/Images/lang.svg';
const KoreaIcon = '/Images/Korea.svg';
const USAIcon = '/Images/USA.svg';

function LangSetting() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const selected: string = i18n.language;

  // 언어 변경
  const changeLanguage = (lng: string) => {
    setCookie('language', lng);
    popupHandler();
    setIsOpen(false);
    i18n.changeLanguage(lng);
  };

  const popupHandler = () => {
    setIsOpen(false);
  };
  return (
    <div className={cx('lang-setting')}>
      {isOpen && (
        <Popup popupHandler={popupHandler}>
          <ul className={cx('options')}>
            <li
              className={cx('option_li', selected === 'ko' && 'selected')}
              onClick={() => changeLanguage('ko')}
            >
              <img className={cx('flag')} src={KoreaIcon} alt='Korea' />
              <span>한국어</span>
            </li>
            <li
              className={cx('option_li', selected === 'en' && 'selected')}
              onClick={() => changeLanguage('en')}
            >
              <img className={cx('flag')} src={USAIcon} alt='USA' />
              <span>ENGLISH</span>
            </li>
          </ul>
        </Popup>
      )}
      <CustomPopupBtn
        show={isOpen}
        setShow={(e) => {
          setIsOpen(e);
        }}
        customStyle={{ padding: '6px' }}
        disableArrow
      >
        <img src={GlobalIcon} alt='language' />
      </CustomPopupBtn>
    </div>
  );
}

export default LangSetting;
