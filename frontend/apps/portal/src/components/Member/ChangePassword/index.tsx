/* eslint-disable no-alert */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import BasicTitle from '@components/Member/common/Header/BasicTitle';
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import BaseInput from '@components/common/Input/BaseInput';
import SuccessButton from '@components/common/Button/SuccessButton';
import { loadingStateAtom } from '@src/atom/ui/Loading';
import { ModalModel } from '@src/atom/ui/Modal';

// shared
import { AUTH_STRING } from '@src/shared/globalDefine';
import { removeAccessTokens } from '@src/shared/functions';

// custom hooks
import usePostNewPassword, {
  MemberPostNewPasswordRequestModel,
} from '@src/common/CustomHooks/Queries/Member/usePostNewPassword';
import useModal from '@src/common/CustomHooks/useModal';
import useMemberLogout, {
  MemberLogoutRequestModel,
} from '@src/common/CustomHooks/Queries/Member/useMemberLogout';

// Style
import styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

// Image
const checkboxIcon = '/Images/member/register/jo-login-ico-check.svg';

function Index() {
  const { t } = useTranslation();
  const { status, data } = useSession();
  const { addModal, removeCurrentModal } = useModal();
  const router = useRouter();
  const postNewPasswordMutation = usePostNewPassword();
  const memberLogoutMutation = useMemberLogout();
  const [openSubmit, setOpenSubmit] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errMsgPassword, setErrMsgPassword] = useState<string>('');
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] =
    useState<boolean>(false);
  const [, setIsLoading] = useRecoilState<boolean>(loadingStateAtom);

  const logout = async () => {
    const body: MemberLogoutRequestModel = {
      user_id: data?.user.id ?? '',
    };
    await memberLogoutMutation.onMutateAsync({ body });
  };

  // 유저 정보 없는 경우 리다이렉트
  useEffect(() => {
    if (status !== AUTH_STRING) {
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 비밀번호 검증
  const handleOnValidationPassword = (isValid: boolean) => {
    if (password === '') {
      setIsPasswordValid(false);
      setErrMsgPassword(t('password-empty'));
    } else {
      setIsPasswordValid(isValid);
      if (!isValid) {
        setErrMsgPassword(t('password-not-correct'));
      } else {
        setIsPasswordValid(true);
      }
    }
  };

  // 비밀번호 확인 검증
  const handleOnValidationConfirmPassword = (isValid: boolean) => {
    if (confirmPassword === '') {
      setIsConfirmPasswordValid(false);
      setErrMsgPassword(t('password-empty'));
    } else if (confirmPassword !== password) {
      setIsConfirmPasswordValid(false);
      setErrMsgPassword(t('password-not-match'));
    } else if (isValid && confirmPassword === password) {
      setIsConfirmPasswordValid(true);
      setErrMsgPassword('');
    }
  };

  const postNewPassword = async () => {
    if (!data) return;

    setIsLoading(true);
    const body: MemberPostNewPasswordRequestModel = {
      username: data.user.username,
      old_password: oldPassword,
      new_password: password,
    };
    await postNewPasswordMutation
      .onMutateAsync({ body })
      .then((res) => {
        if (res.data === 'Success') addModal(changePassSuccessModal);
        else alert(`비밀번호 변경 도중 문제가 발생하였습니다. (${res.data})`);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        alert(t('password-not-match'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSubmit = () => {
    if (isPasswordValid && isConfirmPasswordValid) {
      postNewPassword();
    }
  };

  const changePassSuccessModal: ModalModel = {
    key: 'oneBtnModal',
    props: {
      title: t('password-change-complete'),
      texts: [
        t('password-change-modal-text1'),
        t('password-change-modal-text2'),
      ],
      btns: [
        {
          type: 'success',
          text: t('confirm'),
          onClick: async () => {
            removeCurrentModal();
            removeAccessTokens();
            await logout();
            await signOut({ callbackUrl: '/member' });
          },
        },
      ],
    },
  };

  useEffect(() => {
    setOpenSubmit(false);
    if (isPasswordValid && isConfirmPasswordValid) {
      if (password === confirmPassword) {
        setOpenSubmit(true);
      }
    }
  }, [password, confirmPassword, isPasswordValid, isConfirmPasswordValid]);

  useEffect(() => {
    return () => {
      removeCurrentModal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cx('resetPassword')}>
      <div className={cx('resetPassword__header')}>
        <div className={cx('title-box')}>
          <BasicTitle text={`Change\nyour password`}></BasicTitle>
        </div>
        <div className={cx('sub-title-box')}>
          <BasicSubTitle text={['reset-password-subtitle1']}></BasicSubTitle>
        </div>
      </div>

      <div className={cx('resetPassword__main')}>
        <div className={cx('resetPassword__main-password-box')}>
          <p className={cx('title')}>{t('old-password')}</p>
          <div className={cx('user-password')}>
            <BaseInput
              name='oldPassword'
              val={oldPassword}
              type='password'
              placeholder={t('password')}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <p className={cx('title')}>{t('new-password')}</p>
          <p className={cx('subtitle')}>{t('register-password-rule')}</p>
          <div className={cx('user-password')}>
            <BaseInput
              name='password'
              val={password}
              type='password'
              placeholder={t('password')}
              onChange={(e) => setPassword(e.target.value)}
              onValidation={handleOnValidationPassword}
            />
            {isPasswordValid && (
              <img
                className={cx('user-password-chkbox')}
                src={checkboxIcon}
              ></img>
            )}
          </div>
          <div className={cx('user-password')}>
            <BaseInput
              name='confirmPassword'
              type='password'
              val={confirmPassword}
              placeholder={t('register-password-check')}
              showError={!isPasswordValid || !isConfirmPasswordValid}
              errMsg={errMsgPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onValidation={handleOnValidationConfirmPassword}
              onKeyPressEnter={handleSubmit}
            />
            {isConfirmPasswordValid && (
              <img
                className={cx('user-password-chkbox')}
                src={checkboxIcon}
              ></img>
            )}
          </div>
        </div>

        <div className={cx('resetPassword__main-btn-box')}>
          <SuccessButton
            text={t('password-change')}
            disabled={!openSubmit}
            onClick={handleSubmit}
          ></SuccessButton>
        </div>
      </div>
    </div>
  );
}

export default Index;
