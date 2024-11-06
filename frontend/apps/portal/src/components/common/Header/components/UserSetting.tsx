import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';

// Components
import UserSettingPopup from './UserSettingsPopup';
import CustomPopupBtn from './CustomPopupBtn';

// Custom hooks
import useMemberLogout, {
  MemberLogoutRequestModel,
} from '@src/common/CustomHooks/Queries/Member/useMemberLogout';

// shared
import { removeAccessTokens } from '@src/shared/functions';

// Style
import style from './UserSetting.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

function UserSetting() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  // 로그인한 유저 정보
  const { data: session } = useSession();

  const memberLogoutMutation = useMemberLogout();

  const logout = async () => {
    const body: MemberLogoutRequestModel = {
      user_id: session?.user.id ?? '',
    };
    await memberLogoutMutation.onMutateAsync({ body });
  };

  const popupHandler = () => {
    setIsOpen(!isOpen);
  };

  const onLogout = async () => {
    removeAccessTokens();
    await logout();
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const onChangePassword = () => {
    router.push('/member/change-password');
  };

  const onDeleteAccount = () => {
    router.push('/member/delete-account-agree');
  };

  if (session === null) {
    signOut({ redirect: true, callbackUrl: '/' });
    return <></>;
  }

  return (
    <div className={cx('user-setting')}>
      <div onClick={popupHandler}>
        <CustomPopupBtn
          show={isOpen}
          setShow={(e) => {
            setIsOpen(e);
          }}
        >
          <div className={cx('profile-wrap')}>
            <div className={cx('thumbnail')}>
              <div className={cx('user-initial')}>
                {session.user.username.substr(0, 2).toUpperCase()}
              </div>
            </div>
            <div className={cx('name')}>{session.user.username}</div>
          </div>
        </CustomPopupBtn>
      </div>
      {isOpen && (
        <UserSettingPopup
          setShow={popupHandler}
          userName={session.user.username}
          onLogout={onLogout}
          onChangePassword={onChangePassword}
          onDeleteAccount={onDeleteAccount}
        />
      )}
    </div>
  );
}

export default UserSetting;
