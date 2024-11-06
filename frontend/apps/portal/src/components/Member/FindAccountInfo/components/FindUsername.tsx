import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useRecoilState } from 'recoil';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import SuccessButton from '@components/common/Button/SuccessButton';
import BaseInput from '@components/common/Input/BaseInput';
import { loadingStateAtom } from '@src/atom/ui/Loading';

// Custom hooks
import { useFormInput } from '@src/common/CustomHooks';
import useCheckEmailUnique from '@src/common/CustomHooks/Queries/Member/useCheckEmailUnique';
import useGetUserName from '@src/common/CustomHooks/Queries/Member/useGetUserName';
import { useFormInputValidationArgs } from '@src/common/CustomHooks/useFormInput';

// Style
import classNames from 'classnames/bind';
import styles from './FindUsername.module.scss';

const cx = classNames.bind(styles);

function FindUsername() {
  const { t } = useTranslation();
  const router = useRouter();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [, setIsLoading] = useRecoilState(loadingStateAtom);
  const uniqueEmailMutation = useCheckEmailUnique();
  const getUserNameMutation = useGetUserName();

  //  이메일 검증
  const validateEmail = async ({
    formatValid,
    setErrMsg,
    setIsValid,
  }: useFormInputValidationArgs) => {
    setSubmitOpen(false);
    setIsValid(false);
    if (email.val !== '') {
      if (formatValid) {
        // 이메일 존재여부 확인
        const body = { email: email.val };
        await uniqueEmailMutation
          .onMutateAsync({ body })
          .then((res) => {
            if (res.data === 'duplicated') {
              setSubmitOpen(true);
              setIsValid(true);
              setErrMsg('');
            } else {
              setErrMsg(t('email-not-exist'));
            }
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err);
          });
      } else {
        setErrMsg(t('login-error-email-correct'));
      }
    } else {
      setErrMsg(t('login-error-email-empty'));
    }
  };

  const email = useFormInput('', t('email-address'), validateEmail);

  const handleSubmit = async (
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    if (submitOpen) {
      setIsLoading(true);
      // TOKEN 하드코딩 되있음 ( 백엔드도 하드코딩 ) - 현상태 유지
      const body = {
        email: email.val,
        token: '8nPZYAYTZAmD94owR23u',
      };
      await getUserNameMutation
        .onMutateAsync({ body })
        .then((res) => {
          setUsername(res.data.username);
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
          setUsername('');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <div className={cx('fp-wrap')}>
      <div className={cx('fp-box')}>
        {username ? (
          <>
            <div className={cx('fp-header-box')}>
              <div className={cx('sub-title-box')}>
                <BasicSubTitle
                  text={['username-forgot-subtitle2']}
                ></BasicSubTitle>
              </div>
            </div>
            <div className={cx('fp-body')}>
              <div className={cx('fp-result-box')}>{username}</div>
              <SuccessButton
                onClick={() => {
                  router.push('/member');
                }}
                text={t('register-type-signin')}
              ></SuccessButton>
            </div>
          </>
        ) : (
          <>
            <div className={cx('fp-header-box')}>
              <div className={cx('sub-title-box')}>
                <BasicSubTitle
                  text={['username-forgot-subtitle1']}
                ></BasicSubTitle>
              </div>
            </div>

            <div className={cx('fp-body')}>
              <div className={cx('fp-input-box')}>
                <BaseInput
                  {...email}
                  name='email'
                  type='email'
                  onKeyPressEnter={handleSubmit}
                />
              </div>
              <SuccessButton
                text={t('username-find')}
                disabled={!submitOpen}
                onClick={handleSubmit}
              ></SuccessButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FindUsername;
