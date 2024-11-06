// Style
import styles from './PasswordInput.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

type PasswordInputProps = {
  val?: string;
  placeholder: string;
  showError?: boolean;
  errMsg: string;
  pwErrMsg: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onValidation?: (e: boolean) => void;
};

PasswordInput.defaultProps = {
  val: '',
  showError: false,
  onChange: () => {},
  onBlur: () => {},
  onKeyPressEnter: () => {},
  onValidation: () => {},
};

function PasswordInput({
  val = '',
  placeholder,
  showError = false,
  errMsg,
  pwErrMsg,
  onChange = () => {},
  onBlur = () => {},
  onKeyPressEnter = () => {},
  onValidation = () => {},
}: PasswordInputProps) {
  // 비밀번호 체크
  const checkValidation = () => {
    const pwRule = /^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;
    const isPasswordValid = pwRule.test(val);

    onValidation(isPasswordValid);

    return isPasswordValid;
  };

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
        value={val}
        className={cx(`basic-input`, `password`)}
        placeholder={placeholder}
        type='password'
        onChange={onChange}
        onBlur={handleOnBlur}
        onKeyPress={handleKeyPress}
      />
      {showError && (
        <span className={cx('basic-input-error')}>{pwErrMsg || errMsg}</span>
      )}
    </div>
  );
}

export default PasswordInput;
