/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from 'react';

// Style
import styles from './BaseInput.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

// Image
const emailIcon = '/Images/00-ic-message-mail.svg';
const passwordIcon = '/Images/00-ic-info-lock.svg';
const userIcon = '/Images/member/inputIcon/jo-ico-login-user.svg';

type BaseInputType = {
  name: string;
  val: number | string;
  placeholder: string;
  type: string;
  errMsg?: string;
  showError?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onValidation?: (e: boolean) => void;
  onKeyPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  setIsAutoComplete?: (e: boolean) => void;
};

BaseInput.defaultProps = {
  errMsg: '',
  showError: false,
  disabled: false,
  onChange: () => {},
  onBlur: () => {},
  onValidation: () => {},
  onKeyPressEnter: () => {},
  setIsAutoComplete: () => {},
};

function BaseInput({
  name,
  val,
  placeholder,
  type,
  errMsg = '',
  showError = false,
  disabled = false,
  onChange = () => {},
  onBlur = () => {},
  onValidation = () => {},
  onKeyPressEnter = () => {},
  setIsAutoComplete = () => {},
}: BaseInputType) {
  const [isFocus, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validation을 체크하기 위한 부분
  const checkValidation = () => {
    const textRule = /^(?=.{2,20}$)[ㄱ-ㅎ|가-힣|a-z|A-Z|\s]+$/;
    const usernameRule = /^(?=.{2,20}$)(([a-z0-9]+-?)*[a-z0-9])$/;
    const emailRule =
      /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    const pwRule = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;

    let isValid = false;
    if (type === 'text') {
      if (name === 'username') {
        isValid = usernameRule.test(val as string);
      } else {
        isValid = textRule.test(val as string);
      }
    } else if (type === 'email') {
      isValid = emailRule.test(val as string);
    } else if (type === 'password') {
      isValid = pwRule.test(val as string);
    }
    onValidation(isValid);
    return isValid;
  };

  // 소셜 이메일, 유저네임 바로 validation
  useEffect(() => {
    if (val) {
      checkValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // onBlur 함수
  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (checkValidation()) {
      onBlur(e);
    }
  };

  // 버튼 입력 이벤트
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onKeyPressEnter(e);
    }
  };

  // 자동입력 확인 => 인풋 배경색 변경시 로직 변경 필요
  const checkAutoFill = () => {
    if (inputRef && inputRef.current) {
      const { current } = inputRef;
      // auto fill color
      if (
        window.getComputedStyle(current).background.includes('232, 240, 254')
      ) {
        setIsAutoComplete(true);
      }
    }
  };

  // check auto fill
  useEffect(() => {
    const detect = setTimeout(checkAutoFill, 100);

    return () => {
      clearTimeout(detect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        className={cx('basic-input-box', {
          focus: isFocus,
        })}
      >
        {name === 'email' && (
          <img
            className={cx('input-type-icon')}
            src={emailIcon}
            alt='email'
            width={30}
            height={30}
          />
        )}
        {name === 'name' && (
          <img
            className={cx('input-type-icon')}
            src={userIcon}
            alt='name'
            width={30}
            height={30}
          />
        )}
        {name === 'username' && (
          <img
            className={cx('input-type-icon')}
            src={userIcon}
            alt='username'
            width={30}
            height={30}
          />
        )}
        {name.toLowerCase().indexOf('password') !== -1 && (
          <img
            className={cx('input-type-icon')}
            src={passwordIcon}
            alt='password'
            width={30}
            height={30}
          />
        )}

        {name === 'securityCode' && (
          <img
            className={cx('input-type-icon')}
            src={passwordIcon}
            alt='securityCode'
            width={30}
            height={30}
          />
        )}

        <input
          className={cx('basic-input')}
          name={name}
          ref={inputRef}
          value={val}
          placeholder={placeholder}
          type={type}
          onChange={onChange}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={handleOnBlur}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          // autoComplete={name}
          autoComplete='off'
        />
      </div>
      <span className={cx('basic-input-error')}>{showError && errMsg}</span>
    </>
  );
}

export default BaseInput;
