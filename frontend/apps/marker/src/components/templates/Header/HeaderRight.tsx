import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';

// Store
import { popupState, PopupType } from '@src/stores/components/Popup/Popup';

import { Sypo } from '@src/components/atoms';

// Components
import { LangPopup, UserInfoPopup } from '@src/components/molecules';

import useUserSession from '@src/hooks/auth/useUserSession';

// Icon
import { DownArrowIcon, LangIcon } from '@src/static/images';

import style from './Header.module.scss';
// CSS Module
import classNames from 'classnames/bind';

import i18next from 'i18next';
const cx = classNames.bind(style);

function isLng(lng: string): lng is 'ko' | 'en' {
  if (lng === 'ko' || lng === 'en') return true;
  return false;
}

function HeaderRight() {
  const {
    userSession: { user },
  } = useUserSession();

  const reset = useResetRecoilState(popupState);

  const userInfoBtnRef = useRef<HTMLDivElement>(null);
  const langBtnRef = useRef<HTMLDivElement>(null);
  const userInfoPopupRef = useRef<HTMLDivElement>(null);
  const langPopupRef = useRef<HTMLDivElement>(null);

  const [selectedLng, setSelectedLng] = useState<'ko' | 'en'>(
    isLng(window.localStorage.getItem('language') || '')
      ? (window.localStorage.getItem('language') as 'ko' | 'en')
      : 'ko',
  );
  const [idThumbnail, setIdThumbnail] = useState('');
  const [isOpenPopup, setIsOpenPopup] = useRecoilState<PopupType>(popupState);
  const [innerWidth, setInnerWidth] = useState<number>(window.innerWidth);

  const onClickUserInfo = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const btn = userInfoBtnRef.current;
    const popup = userInfoPopupRef.current;

    if (btn && popup) {
      const isClickBtn = btn.contains(e.target as Node);
      const isClickPopup = popup.contains(e.target as Node);
      if (isClickBtn && !isClickPopup) {
        setIsOpenPopup({
          userInfoPopup: {
            isOpen: !isOpenPopup.userInfoPopup?.isOpen,
          },
        });
      }
    }
  };

  const onClickLangSetting = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const btn = langBtnRef.current;
    const popup = langPopupRef.current;

    if (btn && popup) {
      const isClickBtn = btn.contains(e.target as Node);
      const isClickPopup = popup.contains(e.target as Node);
      if (isClickBtn && !isClickPopup) {
        setIsOpenPopup({
          langSettingPopup: {
            isOpen: !isOpenPopup.langSettingPopup?.isOpen,
          },
        });
      }
    }
  };

  const onChangeLanguage = (lng: 'ko' | 'en') => {
    window.localStorage.setItem('language', lng);
    i18next.changeLanguage(lng);
    setSelectedLng(lng);
    setIsOpenPopup({
      langSettingPopup: {
        isOpen: false,
      },
    });
  };

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    const userInfoBtn = userInfoBtnRef.current;
    const langBtn = langBtnRef.current;
    const langPopup = langPopupRef.current;
    const userInfoPopup = userInfoPopupRef.current;

    if (userInfoBtn && langBtn && langPopup && userInfoPopup) {
      const isClickUserInfo = userInfoBtn.contains(e.target as Node);
      const isClickLang = langBtn.contains(e.target as Node);
      const isClickUserInfoPopup = userInfoPopup.contains(e.target as Node);
      const isClickLangInfoPopup = langPopup.contains(e.target as Node);

      if (!isClickUserInfo && isClickLang) {
        setIsOpenPopup({
          langSettingPopup: {
            isOpen: true,
          },
        });
      } else if (!isClickLang && isClickUserInfo) {
        setIsOpenPopup({
          userInfoPopup: {
            isOpen: true,
          },
        });
      } else if (
        !isClickUserInfo &&
        !isClickLang &&
        !isClickUserInfoPopup &&
        !isClickLangInfoPopup
      ) {
        setIsOpenPopup({});
      }
    }
  };

  useEffect(() => {
    if (user) {
      const curId = user.substring(0, 2).toUpperCase();
      setIdThumbnail(curId);
    }
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const widthListener = () => {
      setInnerWidth(window.innerWidth);
    };
    window.addEventListener('resize', widthListener);
  }, []);

  return (
    <div className={cx('right-section')}>
      <div
        className={cx(
          'user-info-button',
          isOpenPopup.userInfoPopup?.isOpen && 'active',
        )}
        ref={userInfoBtnRef}
        onClick={onClickUserInfo}
      >
        <div className={cx('id-thumbnail')}>
          <Sypo type='P2'>{idThumbnail}</Sypo>
        </div>
        {innerWidth > 900 && (
          <p>
            <Sypo type='P1' weight='B'>
              {user}
            </Sypo>
          </p>
        )}
        <img
          className={cx('arrow', isOpenPopup.userInfoPopup?.isOpen && 'active')}
          style={{ cursor: 'pointer' }}
          src={DownArrowIcon}
          alt='id-thumbnail'
        />
        <UserInfoPopup ref={userInfoPopupRef} />
      </div>
      <div
        className={cx(
          'lang-button',
          isOpenPopup.langSettingPopup?.isOpen && 'active',
        )}
        ref={langBtnRef}
        onClick={onClickLangSetting}
      >
        <img src={LangIcon} alt='lng' style={{ cursor: 'pointer' }} />
        <LangPopup
          selectedLng={selectedLng}
          onChangeLanguage={onChangeLanguage}
          ref={langPopupRef}
        />
      </div>
    </div>
  );
}

export default HeaderRight;
