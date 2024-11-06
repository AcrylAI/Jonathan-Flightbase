import { Properties as CSSProperties } from 'csstype';

import { TextareaSize, TextareaStatus } from './types';
import i18n from 'react-i18next';
import { theme } from '@src/utils';

import classnames from 'classnames/bind';
import style from './Textarea.module.scss';
const cx = classnames.bind(style);

type Props = {
  value?: string;
  name?: string;
  status?: string;
  size?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  placeholder?: string;
  customStyle?: CSSProperties;
  testId?: string;
  theme?: ThemeType;
  options?: { [key: string]: string };
  maxLength?: number;
  isShowMaxLength?: boolean;
  autoFocus?: boolean;
  readonly onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  readonly t?: i18n.TFunction<'translation'>;
};

function Textarea({
  status,
  size,
  value,
  name,
  placeholder,
  isReadOnly,
  isDisabled,
  customStyle,
  testId,
  theme,
  options,
  maxLength,
  isShowMaxLength,
  autoFocus,
  onChange,
  t,
}: Props) {
  return (
    <div
      className={cx(
        'jp',
        'textarea',
        theme,
        size,
        status === TextareaStatus.ERROR && 'error',
      )}
    >
      {isShowMaxLength && (
        <span className={cx('text-length-box', theme)}>
          <span className={cx('text-length')}>{value ? value.length : 0}</span>/
          {maxLength}
        </span>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={t ? t(placeholder || '') : placeholder}
        readOnly={isReadOnly}
        disabled={isDisabled}
        data-testid={testId}
        style={customStyle}
        maxLength={maxLength}
        autoFocus={autoFocus}
        {...options}
      />
    </div>
  );
}

Textarea.defaultProps = {
  value: undefined,
  name: undefined,
  isDisabled: false,
  isReadOnly: false,
  placeholder: '',
  status: TextareaStatus.DEFAULT,
  size: TextareaSize.MEDIUM,
  customStyle: undefined,
  testId: undefined,
  theme: theme.PRIMARY_THEME,
  maxLength: 1000,
  isShowMaxLength: false,
  options: undefined,
  autoFocus: false,
  onChange: undefined,
  t: undefined,
};

export default Textarea;
