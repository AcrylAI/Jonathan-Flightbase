import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { ModalTemplateArgs } from '@jonathan/ui-react/src/components/molecules/FlexibleModal/types';

// react-utils
import { useComponentDidMount } from '@jonathan/react-utils';

// Store
import { ModalAtom } from '@src/stores/components/Modal/ModalAtom';

import ForceLoginModal from '@src/components/organisms/Modal/ForceLoginModal/ForceLoginModal';

import LoginPageContents from '@src/components/pageContents/LoginPageContents/LoginPageContents';

// Page URL
import { ADMIN_URL, USER_URL } from '@src/utils/pageUrls';
import { encrypt } from '@src/utils/utils';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';
// Custom Hooks
import useModal from '@src/hooks/Modal/useModal';

// API Hooks
import useLogin from './hooks/useLogin';
import { LoginForm } from './types';

function LoginPage() {
  const { t } = useT();
  const { login } = useLogin();
  const navigate = useNavigate();

  const emailForm = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const { register, handleSubmit, setFocus } = useForm<LoginForm>({
    mode: 'onSubmit',
    defaultValues: {
      id: '',
      password: '',
    },
  });

  const modalList = useRecoilValue<Array<ModalTemplateArgs>>(ModalAtom);
  const {
    userSession: { user, isAdmin },
  } = useUserSession();

  const loginRef = useRef<HTMLDivElement>(null);
  const modal = useModal();

  const [loginInfo, setLoginInfo] = useState({
    id: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (data: LoginForm) => {
    const { id, password } = data;

    if (id === '' || password === '') {
      setErrorMessage(t(`component.Issue.retryLogin`));
      if (id === '') {
        setFocus('id');
      } else if (password === '') {
        setFocus('password');
      }
      return;
    }

    const isEmailForm = emailForm.test(id);
    if (!isEmailForm) {
      setFocus('id');
      setErrorMessage(t('page.login.invalidEmail'));
      return;
    }

    const isLoginSuccess = await login({
      name: id,
      password: encrypt(password),
      force: 'N',
    });

    if (isLoginSuccess === 0) {
      setErrorMessage(t(`component.Issue.retryLogin`));
      setFocus('id');
    } else if (isLoginSuccess === 1) {
      navigate(USER_URL.PROJECT_PAGE);
    } else if (isLoginSuccess === 2) {
      setLoginInfo({
        id,
        password,
      });
      createModal();
    }
  };

  const createModal = () => {
    modal.createModal({
      size: 'md',
      title: '로그인 모달',
      content: (
        <ForceLoginModal
          id={loginInfo.id}
          password={encrypt(loginInfo.password)}
        />
      ),
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(onSubmit);
    }
  };

  useEffect(() => {
    const loginContainer = loginRef.current;
    if (modalList.length === 0 && loginContainer) {
      loginContainer.focus();
    }
  }, [modalList.length]);

  useEffect(() => {
    return () => {
      modal.closeAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useComponentDidMount(() => {
    if (user) {
      if (isAdmin) {
        navigate(ADMIN_URL.PROJECTS_PAGE);
      } else {
        navigate(USER_URL.PROJECT_PAGE);
      }
    }
  });

  return (
    <LoginPageContents
      errorMessage={errorMessage}
      onKeyDown={onKeyDown}
      onSubmit={onSubmit}
      register={register}
      handleSubmit={handleSubmit}
    />
  );
}

export default LoginPage;
