import React, { useCallback, useEffect } from 'react';

// Style
import styles from './EmailInput.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

type EmailInputType = {
  val: string | number;
  placeholder: string;
  showError?: boolean;
  errMsg?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onValidation?: (e: boolean) => void;
};

EmailInput.defaultProps = {
  showError: false,
  errMsg: '',
  onChange: () => {},
  onBlur: () => {},
  onValidation: () => {},
  onKeyPressEnter: () => {},
  disabled: false,
};

function EmailInput({
  val,
  placeholder,
  showError = false,
  errMsg = '',
  onChange = () => {},
  onBlur = () => {},
  onValidation = () => {},
  onKeyPressEnter = () => {},
  disabled = false,
}: EmailInputType) {
  // 이메일 Validation을 체크하기 위한 부분
  const checkValidation = useCallback(() => {
    const regExp =
      /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    const emailFormat = regExp.test(val as string);
    onValidation(emailFormat);

    return emailFormat;
  }, [onValidation, val]);

  // 소셜 이메일, 닉네임 바로 validation
  useEffect(() => {
    if (val) {
      checkValidation();
    }
  }, [checkValidation, val]);

  // onBlur 함수
  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
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

  return (
    <div className={cx('basic-input-box')}>
      <input
        className={cx(`basic-input`, `email`)}
        type='email'
        value={val}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={handleOnBlur}
        onKeyPress={handleKeyPress}
        disabled={disabled}
      />
      {showError && <span className={cx('basic-input-error')}>{errMsg}</span>}
    </div>
  );
}

export default EmailInput;
