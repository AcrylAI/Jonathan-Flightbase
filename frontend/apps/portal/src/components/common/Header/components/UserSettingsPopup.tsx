/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

// i18n
import { useTranslation } from 'react-i18next';

// Images
const FlightbaseLogo = '/Images/logo/ICO_Flightbase.svg';
const DatascopeLogo = '/Images/logo/ICO_Datascope.svg';
const NubotLogo = '/Images/logo/ICO_Nubot.svg';

// Style
import style from './UserSettingsPopup.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type UserSettingPopupProps = {
  userName: string;
  onLogout: Function;
  onChangePassword: Function;
  onDeleteAccount: Function;
  setShow: Function;
};
const manualOptions = [
  {
    name: 'Flightbase',
    disabled: false,
    hidden: false,
  },
  {
    name: 'Datascope',
    disabled: true,
    hidden: false,
  },
  {
    name: 'Nubot',
    disabled: true,
    hidden: false,
  },
];

function UserSettingsPopup(props: UserSettingPopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);

  const onServiceManual = (service: string) => {
    const link = document.createElement('a');
    if (service === 'Flightbase') {
      link.href = '/manual/Flightbase_User_Guide.pdf'; // 서버에 파일이름은 항상 동일하게 올리고
      link.download = 'Flightbase_User_Guide_210413.pdf'; // 다운로드 받을 때 업데이트 날짜 들어가게 하기
      link.target = '_blank';
    } else if (service === 'Datascope') {
      link.href = '/manual/Datascope_User_Guide.pdf';
      link.download = 'Datascope_User_Guide.pdf';
      link.target = '_blank';
    } else if (service === 'Nubot') {
      link.href = '/manual/Nubot_User_Guide.pdf';
      link.download = 'Nubot_User_Guide.pdf';
      link.target = '_blank';
    }
    link.click();
    link.remove();
  };

  const handleClick = useCallback(
    (e: MouseEvent) => {
      // eslint-disable-next-line react/no-find-dom-node
      if (!ReactDOM.findDOMNode(popupRef.current)?.contains(e.target as Node)) {
        props.setShow();
      }
    },
    [props],
  );

  const capitalizeFirstLetter = (s: string) => {
    return !s || typeof s !== 'string' || s.length <= 0
      ? s
      : s[0].toUpperCase() + s.slice(1);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick, false);

    return () => {
      document.removeEventListener('mousedown', handleClick, false);
    };
  }, [handleClick]);

  return (
    <div className={cx('popup')} ref={popupRef}>
      <div className={cx('top-box')}>
        <div className={cx('user-info')}>
          <div className={cx('hi-logout')}>
            <span className={cx('hi')}>{t('hello')}</span>
            <button
              className={cx('logout-btn')}
              onClick={() => {
                if (props.onLogout) props.onLogout();
              }}
            >
              {t('signout')}
            </button>
          </div>
          <div className={cx('user-name')}>
            <span className={cx('name')}>{props.userName}</span>
            <span className={cx('sir')}>{t('sir')}</span>
          </div>

          <button
            className={cx('password-btn')}
            onClick={() => {
              if (props.onChangePassword) props.onChangePassword();
            }}
          >
            {t('password-change')}
          </button>
        </div>
      </div>
      <div className={cx('manual-box')}>
        {manualOptions.map(
          ({ name, disabled, hidden }) =>
            !hidden && (
              <div
                key={name}
                className={cx('manual-item', disabled && 'disabled')}
                onClick={() => {
                  if (!disabled) onServiceManual(name);
                }}
              >
                <span className={cx('service-manual')}>Service manual</span>
                <span className={cx('service-name')}>
                  {capitalizeFirstLetter(name)}
                </span>
                <img
                  className={cx('service-icon', name)}
                  src={
                    name === 'Flightbase'
                      ? FlightbaseLogo
                      : name === 'Datascope'
                      ? DatascopeLogo
                      : NubotLogo
                  }
                  alt={name}
                />
              </div>
            ),
        )}
      </div>
      <div className={cx('delete-account-box')}>
        <button
          className={cx('delete-account-btn')}
          onClick={() => {
            if (props.onDeleteAccount) props.onDeleteAccount();
          }}
        >
          {t('delete-account')}
        </button>
      </div>
    </div>
  );
}
export default UserSettingsPopup;
