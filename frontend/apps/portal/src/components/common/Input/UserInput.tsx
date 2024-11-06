import React, { useCallback, useEffect } from 'react';

// Style
import styles from './UserInput.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

type UserInputProps = {
  val?: string;
  name?: string;
  placeholder: string;
  showError?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errMsg?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onValidation?: (e: boolean) => void;
  onKeyPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

UserInput.defaultProps = {
  val: '',
  name: '',
  showError: false,
  errMsg: '',
  onChange: () => {},
  onBlur: () => {},
  onValidation: () => {},
  onKeyPressEnter: () => {},
};

function UserInput({
  val = '',
  name = '',
  placeholder,
  showError = false,
  onChange = () => {},
  errMsg = '',
  onBlur = () => {},
  onValidation = () => {},
  onKeyPressEnter = () => {},
}: UserInputProps) {
  // 닉네임 영어,한글,숫자만 가능(2~12)
  const checkValidation = useCallback(() => {
    const nickNameRuleEn = /^[a-zA-Z]{2,12}$/; // 영어만 있을때 최소2,최대12
    const nickNameRuleKo = /^[\w\Wㄱ-ㅎㅏ-ㅣ가-힣]{2,10}$/; // 한글 섞이면 최소2, 최대10

    const isValid = nickNameRuleEn.test(val) || nickNameRuleKo.test(val);

    onValidation(isValid);

    return isValid;
  }, [onValidation, val]);

  // 소셜 닉네임 바로 검증
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
        type='text'
        name={name}
        value={val}
        className={cx(`basic-input`, `user`)}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={handleOnBlur}
        onKeyPress={handleKeyPress}
      />
      {showError && <span className={cx('basic-input-error')}>{errMsg}</span>}
    </div>
  );
}

export default UserInput;
