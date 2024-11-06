import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import ReactDOM from 'react-dom';

// i18n
import { useTranslation } from 'react-i18next';

// Actions
import { logoutRequest } from '@src/store/modules/auth';
import { openModal } from '@src/store/modules/modal';

// CSS module
import style from './UserSettingsPopup.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

const MODE = import.meta.env.VITE_REACT_APP_MODE.toLowerCase();

// DNA+DRONE 챌린지 여부
const IS_DNADRONECHALLENGE =
  import.meta.env.VITE_REACT_APP_SERVICE_LOGO === 'DNA+DRONE' &&
  import.meta.env.VITE_REACT_APP_IS_CHALLENGE === 'true';

function UserSettingsPopup({ popupHandler, userName, jpUserName }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const popup = useRef(null);

  /**
   * 비밀번호 변경 모달 오픈
   */
  const openPasswordPopup = () => {
    dispatch(
      openModal({
        modalType: 'CHANGE_PASSWORD',
        modalData: {
          submit: {
            text: 'update.label',
          },
          cancel: {
            text: 'cancel.label',
          },
        },
      }),
    );
  };

  const onLogout = () => {
    dispatch(logoutRequest());
    // dispatch(closeHeaderPopup());
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        popup.current &&
        !ReactDOM.findDOMNode(popup.current).contains(e.target)
      ) {
        popupHandler();
      }
    };
    document.addEventListener('click', handleClick, false);
    return () => {
      document.removeEventListener('click', handleClick, false);
    };
  }, [popupHandler]);

  return (
    <div className={cx('popup', MODE !== 'integration' && 'small')} ref={popup}>
      <div className={cx('top-box')}>
        <div className={cx('user-info')}>
          <div className={cx('hi-logout')}>
            <span className={cx('hi')}>{t('hello.label')}</span>
            <button
              className={cx('logout-btn')}
              onClick={onLogout}
              data-testid='logout-btn'
            >
              {t('logout.label')}
            </button>
          </div>
          <div className={cx('user-name')}>
            <span className={cx('name')}>{jpUserName || userName}</span>
            <span className={cx('sir')}>{t('sir.label')}</span>
          </div>
          {MODE === 'integration' ? (
            <button
              className={cx('dashboard-btn')}
              onClick={() => {
                window.location.href = 'https://portal.acryl.ai';
              }}
            >
              {t('goToPortalPage.label')}
            </button>
          ) : (
            !IS_DNADRONECHALLENGE && (
              <button
                className={cx('password-btn')}
                onClick={() => openPasswordPopup()}
              >
                {t('changePassword.label')}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default UserSettingsPopup;
