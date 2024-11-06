import { InputDateSize, InputDateStatus, InputDateIconSizeType } from './types';

// CSS Module
import classNames from 'classnames/bind';
import style from './InputDate.module.scss';

const cx = classNames.bind(style);

type Props = {
  status?: string;
  size?: string;
  value?: string;
  customSize?: InputDateIconSizeType;
  max?: number;
  min?: number;
  name?: string;
  disabled?: boolean;
  isReadOnly?: boolean;
  placeholder?: string;
  readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function InputDate({
  status,
  size,
  placeholder,
  isReadOnly,
  disabled,
  value,
  max,
  min,
  name,
  customSize,
  onChange,
}: Props) {
  return (
    <div
      className={cx(
        'jp',
        'input',
        'input-date',
        isReadOnly && 'read-only',
        size,
        status === InputDateStatus.ERROR && 'error',
      )}
    >
      <input
        type='date'
        min={min}
        max={max}
        name={name}
        placeholder={placeholder}
        value={value === undefined ? '' : value}
        disabled={disabled}
        readOnly={isReadOnly}
        style={customSize}
        onChange={onChange}
      />
    </div>
  );
}

InputDate.defaultProps = {
  value: '',
  status: InputDateStatus.DEFAULT,
  size: InputDateSize.MEDIUM,
  max: undefined,
  min: undefined,
  disabled: false,
  isReadOnly: false,
  placeholder: undefined,
  customSize: undefined,
  onChange: undefined,
  name: undefined,
};

export default InputDate;
