import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

// Store
import type { PopupType } from '@src/stores/components/Popup/Popup';
import { popupState } from '@src/stores/components/Popup/Popup';

// Components
import { Popup, Sypo } from '@src/components/atoms';

import ChangePasswordModal from '@src/components/organisms/Modal/ChangePasswordModal/ChangePasswordModal';

import { BLUE104, MONO204 } from '@src/utils/color';
import { NONE_URL } from '@src/utils/pageUrls';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import useLogout from './hooks/useLogout';

import style from './UserInfoPopup.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const UserInfoPopup = forwardRef<HTMLDivElement>((_, ref) => {
  const { t } = useT();
  const {
    userSession: { isAdmin, user },
  } = useUserSession();
  const nav = useNavigate();
  const isOpenPopup = useRecoilValue<PopupType>(popupState);
  const { logout } = useLogout();
  const modal = useModal();

  const onLogout = () => {
    if (isAdmin) {
      window.close();
    } else {
      logout();
    }
  };
  const changePassword = () => {
    modal.createModal({
      title: 'change password',
      content: <ChangePasswordModal />,
    });
  };
  const loginAsLabeler = () => {
    sessionStorage.clear();
    nav(NONE_URL.LOGIN_PAGE);
  };

  return (
    <div ref={ref}>
      <Popup
        customStyle={{
          padding: '24px 24px 32px 24px',
          transform: 'translateY(8px)',
        }}
        isOpen={isOpenPopup.userInfoPopup?.isOpen ?? false}
        align={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <>
          <div className={cx('header')}>
            <Sypo type='P1' ellipsis color={MONO204}>
              {t(`component.userPopup.greedings`)}
            </Sypo>
            <div
              onClick={() => {
                onLogout();
              }}
              className={cx('sign-out')}
            >
              <Sypo type='P1' ellipsis color={MONO204}>
                {isAdmin
                  ? `${t(`component.userPopup.close`)}`
                  : `${t(`component.userPopup.logout`)}`}
              </Sypo>
            </div>
          </div>
          <div className={cx('user-name')}>
            <Sypo type='H4' ellipsis>
              {user}
            </Sypo>
          </div>
          <div
            className={cx('change-btn')}
            onClick={isAdmin ? loginAsLabeler : changePassword}
          >
            <Sypo type='P1' color={BLUE104}>
              {isAdmin
                ? `${t(`component.userPopup.labelerLogin`)}`
                : `${t(`component.btn.changePassword`)}`}
            </Sypo>
          </div>
        </>
      </Popup>
    </div>
  );
});

export default UserInfoPopup;
