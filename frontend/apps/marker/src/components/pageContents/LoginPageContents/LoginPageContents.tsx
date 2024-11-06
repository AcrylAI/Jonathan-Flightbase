import { useState } from 'react';
import type { UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';

import { Button } from '@jonathan/ui-react';

import type { LoginForm } from '@src/pages/LoginPage/types';

import { Sypo } from '@src/components/atoms';

import { RED502 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import {
  ColorLogo,
  EyesClose,
  EyesOpen,
  LockIcon,
  PersonIcon,
} from '@src/static/images';

import style from './LoginPageContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  errorMessage: string;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: (info: LoginForm) => void;
  register: UseFormRegister<LoginForm>;
  handleSubmit: UseFormHandleSubmit<LoginForm>;
};

function LoginPageContents({
  errorMessage,
  onKeyDown,
  onSubmit,
  register,
  handleSubmit,
}: Props) {
  const [passwordType, setPasswordType] = useState(false);

  const { t } = useT();

  const onTogglePasswordType = () => {
    setPasswordType((passwordType) => !passwordType);
  };

  return (
    <div className={cx('login-container')}>
      <div className={cx('left-container')}>
        <div className={cx('desc-contents')}>
          <img
            className={cx('marker-icon')}
            src={ColorLogo}
            alt='marker-logo'
          />
          <div className={cx('welcome-title')}>MORE THAN READY TO FLY</div>
          <div className={cx('welcome-subtitle')}>
            For your AIs’ development and operation
          </div>
        </div>
      </div>
      <div className={cx('line')}></div>
      <div className={cx('right-container')}>
        <div className={cx('login-contents')}>
          <form className={cx('contents')} onSubmit={handleSubmit(onSubmit)}>
            <div className={cx('welcome-label')}>환영합니다.</div>
            <div className={cx('input-contents')}>
              <div className={cx('id')}>
                <img src={PersonIcon} alt='user' />
                <input
                  placeholder={t(`component.inputBox.email`)}
                  onKeyDown={onKeyDown}
                  autoComplete='off'
                  {...register('id')}
                />
              </div>
              <div className={cx('pw')}>
                <img src={LockIcon} alt='lock' />
                <input
                  placeholder={t('component.inputBox.pw')}
                  type={!passwordType ? 'password' : 'text'}
                  onKeyDown={onKeyDown}
                  autoComplete='off'
                  {...register('password')}
                ></input>
                <img
                  className={cx('eye-icon')}
                  src={!passwordType ? EyesClose : EyesOpen}
                  alt='eye'
                  onClick={onTogglePasswordType}
                />
              </div>
            </div>
            <div className={cx('error-msg')}>
              <Sypo type='P1' color={RED502}>
                {errorMessage}
              </Sypo>
            </div>
            <Button
              customStyle={{
                width: '100%',
                height: '56px',
              }}
              btnType='submit'
            >
              <Sypo type='P1'>{t('component.btn.login')}</Sypo>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPageContents;
