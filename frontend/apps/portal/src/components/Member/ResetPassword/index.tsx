/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import BasicTitle from '@components/Member/common/Header/BasicTitle';
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import BaseInput from '@components/common/Input/BaseInput';
import SuccessButton from '@components/common/Button/SuccessButton';
import { loadingStateAtom } from '@src/atom/ui/Loading';
import { ModalModel } from '@src/atom/ui/Modal';

// Custom hooks
import useModal from '@src/common/CustomHooks/useModal';
import useMemberResetPassword from '@src/common/CustomHooks/Queries/Member/useResetPassword';

// Style
import styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

// Image
const checkboxIcon = '/Images/member/register/jo-login-ico-check.svg';

function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const { addModal, removeCurrentModal } = useModal();
  const memberResetPasswordMutation = useMemberResetPassword();
  const [openSubmit, setOpenSubmit] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errMsgPassword, setErrMsgPassword] = useState<string>('');
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] =
    useState<boolean>(false);
  const [, setIsLoading] = useRecoilState<boolean>(loadingStateAtom);
  const [passwordToken, setPasswordToken] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (router.isReady) {
      const { reset_key: resetKey, username } = router.query;
      if (resetKey && username) {
        setPasswordToken(Array.isArray(resetKey) ? resetKey[0] : resetKey);
        setUsername(Array.isArray(username) ? username[0] : username);
      } else {
        router.push('/');
      }
    }
  }, [router]);

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
      setErrMsgPassword('password-not-correct');
    } else if (isValid && confirmPassword === password) {
      setIsConfirmPasswordValid(true);
      setErrMsgPassword('');
    }
  };

  const postNewPassword = async () => {
    setIsLoading(true);
    const body = { reset_key: passwordToken, new_password: password, username };
    await memberResetPasswordMutation
      .onMutateAsync({ body })
      .then(() => {
        handleShowModal();
      })
      .catch((err) => {
        // eslint-disable-next-line no-alert
        alert('요청이 만료되었습니다.');
        // eslint-disable-next-line no-console
        console.log(err);
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

  const handleShowModal = () => {
    const changePwSuccessModal: ModalModel = {
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
            onClick: () => {
              router.push('/member');
              removeCurrentModal();
            },
          },
        ],
      },
    };
    addModal(changePwSuccessModal);
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
      {/* 헤더 */}
      <div className={cx('resetPassword__header')}>
        <div className={cx('title-box')}>
          <BasicTitle text={`Forgot\nyour password?`}></BasicTitle>
        </div>
        <div className={cx('sub-title-box')}>
          <BasicSubTitle
            text={['reset-password-subtitle1', 'reset-password-subtitle2']}
          ></BasicSubTitle>
        </div>
      </div>

      {/* 바디 */}
      <div className={cx('resetPassword__main')}>
        <div className={cx('resetPassword__main-password-box')}>
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
                alt='check'
              />
            )}
          </div>
          <div className={cx('user-password')}>
            <BaseInput
              name='password'
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
                alt='check'
              />
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
