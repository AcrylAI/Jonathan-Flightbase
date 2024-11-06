import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { useRecoilState } from 'recoil';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import BasicTitle from '@components/Member/common/Header/BasicTitle';
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import BaseInput from '@components/common/Input/BaseInput';
import SuccessButton from '@components/common/Button/SuccessButton';
import { ModalModel } from '@src/atom/ui/Modal';
import { loadingStateAtom } from '@src/atom/ui/Loading';

// shared
import { AUTH_STRING } from '@src/shared/globalDefine';
import { removeAccessTokens } from '@src/shared/functions';

// Custom hooks
import useDeleteAccount from '@src/common/CustomHooks/Queries/Member/useDeleteAccount';
import useModal from '@src/common/CustomHooks/useModal';
import useMemberLogout, {
  MemberLogoutRequestModel,
} from '@src/common/CustomHooks/Queries/Member/useMemberLogout';

// Sytle
import styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const [openSubmit, setOpenSubmit] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [errMsgPassword, setErrMsgPassword] = useState<string>('');
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);
  const [, setIsLoading] = useRecoilState<boolean>(loadingStateAtom);
  const { status, data } = useSession();
  const { addModal, removeCurrentModal } = useModal();
  const deleteAccountMutation = useDeleteAccount();

  const memberLogoutMutation = useMemberLogout();

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
      setErrMsgPassword('');
      setIsPasswordValid(isValid);
    }
  };

  const deleteAccount = async () => {
    if (!data) return;
    setIsLoading(true);
    const body = { username: data.user.username, password };
    await deleteAccountMutation
      .onMutateAsync({ body })
      .then((res) => {
        if (res.data === 'Success') {
          removeAccessTokens();
          handleShowModal();
          logout();
          signOut({ redirect: false });
        } else if (res.data === 'Wrong Password') {
          setErrMsgPassword(t('delete-account-wrong-password'));
        } else {
          setErrMsgPassword(res.data);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSubmit = () => {
    if (isPasswordValid) {
      deleteAccount();
    }
  };

  const handleShowModal = () => {
    const deleteAccountSuccessModal: ModalModel = {
      key: 'oneBtnModal',
      props: {
        title: t('delete-account-complete'),
        texts: [
          t('delete-account-modal-text1'),
          t('delete-account-modal-text2'),
        ],
        btns: [
          {
            type: 'success',
            text: t('confirm'),
            onClick: () => {
              removeCurrentModal();
              router.replace('/');
            },
          },
        ],
      },
    };

    addModal(deleteAccountSuccessModal);
  };

  useEffect(() => {
    setOpenSubmit(false);
    if (password && isPasswordValid) {
      setOpenSubmit(true);
    }
  }, [password, isPasswordValid]);

  useEffect(() => {
    return () => {
      removeCurrentModal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cx('auth')}>
      {/* 헤더 */}
      <div className={cx('auth__header')}>
        <div className={cx('title-box')}>
          <BasicTitle text='Delete Account'></BasicTitle>
        </div>
        <div className={cx('sub-title-box')}>
          <BasicSubTitle
            text={[
              'delete-account-auth-subtitle1',
              'delete-account-auth-subtitle2',
            ]}
          ></BasicSubTitle>
        </div>
      </div>

      {/* 바디 */}
      <div className={cx('auth__main')}>
        <div className={cx('auth__main-password-box')}>
          <p className={cx('title')}>{t('password')}</p>
          <div className={cx('user-password')}>
            <BaseInput
              name='password'
              val={password}
              type='password'
              placeholder={t('password')}
              onChange={(e) => setPassword(e.target.value)}
              onValidation={handleOnValidationPassword}
              errMsg={errMsgPassword}
            />
          </div>
        </div>

        <div className={cx('auth__main-btn-box')}>
          <SuccessButton
            text={t('confirm')}
            disabled={!openSubmit}
            onClick={handleSubmit}
          ></SuccessButton>
        </div>
      </div>
    </div>
  );
}

export default Index;
