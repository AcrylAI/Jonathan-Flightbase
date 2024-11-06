import { forwardRef } from 'react';
import { initDateRangePickerStatus } from '../types';
import i18n from 'react-i18next';

import { initInputSize, CalendarType, CustomStyleType } from '../types';

import classnames from 'classnames/bind';
import style from './DateRangePickerSplitInput.module.scss';
const cx = classnames.bind(style);

type Props = {
  status: string;
  inputSize: string;
  placeholder: string;
  calendarType: CalendarType;
  value: string;
  isValidate: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  customStyle?: CustomStyleType;
  onOpenCalendar: () => void;
  onInputChange: (
    calendarType: CalendarType,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  t?: i18n.TFunction<'translation'>;
};

const DateRangePickerSplitInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      status = initDateRangePickerStatus.DEFAULT,
      inputSize = initInputSize.MEDIUM,
      placeholder,
      calendarType,
      value = '',
      isValidate,
      isDisabled,
      isReadOnly,
      customStyle,
      onOpenCalendar,
      onInputChange,
      t,
    },
    ref,
  ): JSX.Element => {
    return (
      <input
        className={cx(inputSize, !isValidate ? 'error' : status)}
        type='text'
        placeholder={t && placeholder ? t(placeholder) : placeholder}
        disabled={isDisabled}
        readOnly={isReadOnly}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onInputChange(calendarType, e);
        }}
        onClick={onOpenCalendar}
        autoComplete='off'
        name={calendarType}
        ref={ref}
        value={value}
        style={{
          ...customStyle?.inputForm,
          ...customStyle?.inputFont,
        }}
      />
    );
  },
);

DateRangePickerSplitInput.defaultProps = {
  customStyle: undefined,
  t: undefined,
};

export default DateRangePickerSplitInput;
