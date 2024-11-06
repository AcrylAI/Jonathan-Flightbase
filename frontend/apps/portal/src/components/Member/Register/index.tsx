/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import BaseInput from '@components/common/Input/BaseInput';
import SuccessButton from '@components/common/Button/SuccessButton';
import BasicTitle from '@components/Member/common/Header/BasicTitle';
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import RegisterProgress from '@components/Member/common/RegisterProgress/RegisterProgress';
import { loadingStateAtom } from '@src/atom/ui/Loading';

// CustomHooks
import { useFormInput } from '@src/common/CustomHooks';
import { useFormInputValidationArgs } from '@src/common/CustomHooks/useFormInput';
import useCheckEmailUnique from '@src/common/CustomHooks/Queries/Member/useCheckEmailUnique';
import useCheckUserNameUnique from '@src/common/CustomHooks/Queries/Member/useCheckUserNameUnique';
import useMemberRegister from '@src/common/CustomHooks/Queries/Member/useMemberRegister';

// Style
import classNames from 'classnames/bind';
import styles from './index.module.scss';
const cx = classNames.bind(styles);

// Image
const checkboxIcon = '/Images/member/register/jo-login-ico-check.svg';

function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const uniqueEmailMutation = useCheckEmailUnique();
  const uniqueUserNameMutation = useCheckUserNameUnique();
  const memberRegisterMutation = useMemberRegister();
  const [, setIsLoading] = useRecoilState(loadingStateAtom);

  // 아이디 검증
  const validateUserName = async ({
    formatValid,
    setErrMsg,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setIsValid(false);
    if (userName.val !== '') {
      if (formatValid) {
        // 중복체크
        const body = { username: userName.val };
        const { data } = await uniqueUserNameMutation.onMutateAsync({ body });
        if (data && data === 'unique') {
          setIsValid(true);
          setErrMsg('');
        } else {
          setErrMsg(t('duplicate-username'));
        }
      } else {
        setErrMsg(t('username-not-correct'));
      }
    } else {
      setErrMsg(t('login-error-username-empty'));
    }
  };

  const userName = useFormInput('', t('register-username'), validateUserName);

  // 이메일 검증
  const validationEmail = async ({
    formatValid,
    setErrMsg,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setIsValid(false);
    if (email.val) {
      if (formatValid) {
        // 중복체크
        const body = {
          email: email.val,
        };
        const { data } = await uniqueEmailMutation.onMutateAsync({ body });
        if (data && data === 'unique') {
          setIsValid(true);
          setErrMsg('');
        } else {
          setErrMsg(t('duplicate-email'));
        }
      } else {
        setErrMsg(t('login-error-email-correct'));
      }
    } else {
      setErrMsg(t('login-error-email-empty'));
    }
  };

  // 이메일
  const email = useFormInput('', t('register-email'), validationEmail);

  // 비밀번호 검증
  const validationPassword = ({
    formatValid,
    setErrMsg,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setIsValid(false);
    if (password.val) {
      if (formatValid) {
        setIsValid(true);
        setErrMsg('');
      } else {
        setErrMsg(t('password-not-correct'));
      }
    } else {
      setErrMsg(t('password-empty'));
    }
  };

  // 비밀번호 확인 검증
  const validationConfirmPassword = ({
    formatValid,
    setErrMsg,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setIsValid(false);
    setErrMsg('');
    if (password.isValid) {
      if (confirmPassword.val === '') {
        setErrMsg(t('password-confirm-empty'));
      } else if (confirmPassword.val !== password.val) {
        setErrMsg(t('password-not-match'));
      } else if (formatValid && confirmPassword.val === password.val) {
        setIsValid(true);
      }
    }
  };

  const password = useFormInput('', t('password'), validationPassword);
  const confirmPassword = useFormInput(
    '',
    t('register-password-check'),
    validationConfirmPassword,
  );

  const [openSubmit, setOpenSubmit] = useState(false);

  // 회원가입 버튼 클릭
  const handleSubmit = async (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsLoading(true);

    const body = {
      email: email.val,
      pwd_org: password.val,
      username: userName.val,
    };

    // API CALL
    await memberRegisterMutation
      .onMutateAsync({ body })
      .then((res) => {
        if (res.data.token) {
          router.push('/member/register-finished');
        }
      })
      .catch((err) => {
        const error = err.response?.data?.fieldErrors;
        if (error) {
          if (error['user.email']?.length > 0) {
            email.setErrMsg(t('duplicate-email'));
            email.setIsValid(false);
          }
          if (error['user.username']?.length > 0) {
            userName.setErrMsg(t('duplicate-username'));
            userName.setIsValid(false);
          }
        } else {
          // eslint-disable-next-line no-alert
          alert('network error');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // 버튼 활성화
  useEffect(() => {
    setOpenSubmit(false);

    if (userName.isValid && email.isValid && password.isValid) {
      if (password.val === confirmPassword.val) {
        setOpenSubmit(true);
      }
    }
  }, [
    userName.isValid,
    email.isValid,
    password.isValid,
    confirmPassword.val,
    password.val,
  ]);

  return (
    <div className={cx('register')}>
      {/* 회원가입 헤더 */}
      <div className={cx('register__header')}>
        <div className={cx('register__header--main')}>
          <BasicTitle text='Sign Up'></BasicTitle>
        </div>
        <div className={cx('register__header--sub')}>
          <BasicSubTitle
            text={['register-type-subtitle1', 'register-subtitle']}
          ></BasicSubTitle>
        </div>
      </div>

      <RegisterProgress progress={2} />

      {/* 기본 정보 박스 */}
      <div className={cx('register__user-info-box')}>
        {/* 아이디 */}
        <div className={cx('username-box')}>
          <BaseInput {...userName} name='username' type='text' />
          {userName && userName.isValid && (
            <img
              className={cx('register__chkbox')}
              src={checkboxIcon}
              alt='check'
            />
          )}
        </div>
        {/* 이메일 */}
        <div className={cx('user-email')}>
          <BaseInput {...email} name='email' type='email' />
          {email && email.isValid && (
            <img
              className={cx('register__chkbox')}
              src={checkboxIcon}
              alt='check'
            />
          )}
        </div>

        {/* 프로필 박스 */}
        <div className={cx('register__profile-box')}></div>

        {/* 비밀번호 */}
        <div className={cx('user-password-box')}>
          <span>{t('register-password-rule')}</span>
          <div className={cx('user-password')}>
            <BaseInput {...password} name='password' type='password' />
            {password.isValid && (
              <img
                className={cx('register__chkbox')}
                src={checkboxIcon}
                alt='check'
              />
            )}
          </div>
          <div className={cx('user-password')}>
            <BaseInput
              {...confirmPassword}
              name='confirmPassword'
              type='password'
            />
            {confirmPassword.isValid && (
              <img
                className={cx('register__chkbox')}
                src={checkboxIcon}
                alt='check'
              />
            )}
          </div>
        </div>
      </div>

      {/* 회원가입 박스 */}
      <div className={cx('register__submit-box')}>
        <SuccessButton
          disabled={!openSubmit}
          text={t('signup')}
          onClick={(e) => handleSubmit(e)}
        ></SuccessButton>
      </div>
    </div>
  );
}

export default Index;
