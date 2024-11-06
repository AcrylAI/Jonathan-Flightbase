// Style
import styles from './PhoneAuthInput.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

type PhoneAuthInputProps = {
  placeholder: string;
  type: string;
  val?: string;
  showError?: boolean;
  errMsg?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  disabled?: boolean;
};

PhoneAuthInput.defaultProps = {
  val: '',
  showError: false,
  errMsg: '',
  onChange: () => {},
  onKeyPress: () => {},
  onBlur: () => {},
  disabled: false,
};

function PhoneAuthInput({
  val = '',
  placeholder,
  showError = false,
  errMsg = '',
  onChange = () => {},
  onKeyPress = () => {},
  onBlur = () => {},
  disabled = false,
  type,
}: PhoneAuthInputProps) {
  // 버튼 입력 이벤트
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onBlur();
      onKeyPress(e);
    }
  };

  return (
    <div className={cx('basic-input-box')}>
      <input
        className={cx(`basic-input`, type)}
        type='text'
        value={val}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        onKeyPress={handleKeyPress}
        disabled={disabled}
      />
      {showError && errMsg !== '' && (
        <span
          className={
            disabled
              ? cx('basic-input-span', 'basic-input-span--success')
              : cx('basic-input-span', 'basic-input-span--error')
          }
        >
          {errMsg}
        </span>
      )}
    </div>
  );
}

export default PhoneAuthInput;
