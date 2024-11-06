/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';

// i18n
import { useTranslation } from 'react-i18next';

// Custom hooks
import { useFormInput } from '@src/common/CustomHooks';
import { useFormInputValidationArgs } from '@src/common/CustomHooks/useFormInput';

// Components
import BasicTitle from '@components/Member/common/Header/BasicTitle';
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import BaseInput from '@components/common/Input/BaseInput';
import SuccessButton from '@components/common/Button/SuccessButton';
import { loadingStateAtom } from '@src/atom/ui/Loading';

// shared
import { AUTH_STRING } from '@src/shared/globalDefine';

// Style
import styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function MemberLogin() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status } = useSession();
  const [showError, setShowError] = useState<boolean>(false);
  const [usernameErrMsg, setUsernameErrMsg] = useState<string>('');
  const [passwordErrMsg, setPasswordErrMsg] = useState<string>('');
  const [openSubmit, setOpenSubmit] = useState<boolean>(false);
  const [, setIsLoading] = useRecoilState<boolean>(loadingStateAtom);
  const [nameAutoFill, setNameAutoFill] = useState<boolean>(false);
  const [passAutoFill, setPassAutoFill] = useState<boolean>(false);

  const callbackUrl = Array.isArray(router.query.callbackUrl)
    ? router.query.callbackUrl[0]
    : router.query.callbackUrl;

  // 아이디, 비밀번호 확인
  const handleSubmit = async (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await signIn('email-password-credential', {
      userName: userName.val,
      password: password.val,
      redirect: false,
    });

    setIsLoading(false);
    if (res && res.status === 200) {
      if (callbackUrl) {
        // 로그인 후에는 아이디/비밀번호 찾기나 회원가입으로 돌아갈 필요가 없음
        if (callbackUrl.includes('find-account') || callbackUrl.includes('join-request')) {
          router.push('/');
        }
        const url =
          callbackUrl.includes('http://') || callbackUrl.includes('https://')
            ? callbackUrl
            : `http://${callbackUrl}`;
        window.location.href = url;
      } else {
        router.push('/');
      }
    } else {
      setShowError(true);
      setPasswordErrMsg(res && res.error ? res.error : 'Server Error');
    }
  };

  // Validation 체크
  const validationUsername = ({
    formatValid,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setShowError(true);
    setIsValid(false);

    if (formatValid) {
      setShowError(false);
      setIsValid(true);
      setUsernameErrMsg('');
      setOpenSubmit(true);
    } else if (userName.val === '') {
      setUsernameErrMsg(t('login-error-username-empty'));
      setOpenSubmit(false);
    } else {
      setUsernameErrMsg(t('login-error-username-correct'));
      setOpenSubmit(false);
    }
  };

  const userName = useFormInput('', t('username'), validationUsername);
  const password = useFormInput('', t('password'), () => {});

  const checkForm = useCallback(() => {
    if (!nameAutoFill || !passAutoFill) {
      if (userName.val && password.val && userName.isValid) {
        setOpenSubmit(true);
      } else {
        setOpenSubmit(false);
      }
    }
  }, [
    nameAutoFill,
    passAutoFill,
    password.val,
    userName.isValid,
    userName.val,
  ]);

  useEffect(() => {
    checkForm();
  }, [userName, password, checkForm]);

  useEffect(() => {
    if (nameAutoFill && passAutoFill) {
      setOpenSubmit(true);
    }
  }, [nameAutoFill, passAutoFill]);

  useEffect(() => {
    if (status === AUTH_STRING) router.push('/');
  }, [router, status]);

  return (
    <div className={cx('login-wrap')}>
      <div>
        {/* 로그인 헤더 */}
        <div className={cx('login-header-box')}>
          <div className={cx('title-box')}>
            <BasicTitle text='Login'></BasicTitle>
          </div>
          <div className={cx('sub-title-box')}>
            <BasicSubTitle
              text={['login-subtitle1', 'login-subtitle2']}
            ></BasicSubTitle>
          </div>
        </div>

        {/* 로그인 바디 */}
        <div className={cx('user-body-container')}>
          <div className={cx('user-info-box')}>
            <form>
              <div className={cx('id-box')}>
                <BaseInput
                  {...userName}
                  name='username'
                  type='text'
                  showError={showError}
                  errMsg={usernameErrMsg}
                  onKeyPressEnter={handleSubmit}
                  setIsAutoComplete={(e) => {
                    setNameAutoFill(e);
                  }}
                />
              </div>

              <div className={cx('password-box')}>
                <BaseInput
                  {...password}
                  name='password'
                  type='password'
                  showError={showError}
                  errMsg={passwordErrMsg}
                  onKeyPressEnter={handleSubmit}
                  setIsAutoComplete={(e) => {
                    setPassAutoFill(e);
                  }}
                />
              </div>
            </form>
          </div>

          <div className={cx('submit-button-box')}>
            <SuccessButton
              text={t('signin')}
              disabled={!openSubmit}
              onClick={handleSubmit}
            ></SuccessButton>
          </div>

          <div className={cx('user-event-container')}>
            {/* <Link href='/member/type' passHref>
              <a className={cx('event-item')}>{t('login-signup')}</a>
            </Link> */}
            <Link href='/member/join-request' passHref>
              <a className={cx('event-item')}>{t('request-to-join')}</a>
            </Link>

            <span className={cx('division')}>|</span>
            <Link href='/member/find-account' passHref>
              <a className={cx('event-item')}>{t('forgot-account')}</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default MemberLogin;
