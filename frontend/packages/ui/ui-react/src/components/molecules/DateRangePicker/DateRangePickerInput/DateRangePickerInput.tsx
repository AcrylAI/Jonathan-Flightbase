import { forwardRef, RefObject } from 'react';
import i18n from 'react-i18next';

// Types
import { CalendarType, CustomStyleType } from '../types';

// CSS Module
import classNames from 'classnames/bind';
import style from './DateRangePickerInput.module.scss';
const cx = classNames.bind(style);

type Props = {
  status: string;
  inputSize: string;
  fromPlaceholder: string;
  toPlaceholder: string;
  fromDate: string;
  toDate: string;
  isReadonly: boolean;
  isDisable: boolean;
  fromValidation: boolean;
  toValidation: boolean;
  isOpenCalendar: boolean;
  customStyle?: CustomStyleType;
  onOpenCalendar: () => void;
  onInputChange: (
    calendarType: CalendarType,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  t?: i18n.TFunction<'translation'>;
};

const DateRangePickerInput = forwardRef<HTMLDivElement, Props>(
  (
    {
      status,
      inputSize,
      fromPlaceholder,
      toPlaceholder,
      fromDate,
      toDate,
      isReadonly,
      isDisable,
      fromValidation,
      toValidation,
      isOpenCalendar,
      customStyle,
      onOpenCalendar,
      onInputChange,
      t,
    },
    ref,
  ) => {
    return (
      <div
        className={cx(
          inputSize,
          status,
          isOpenCalendar && 'active',
          isReadonly && 'readonly',
          isDisable && 'disabled',
          (!fromValidation || !toValidation) && 'error',
        )}
        ref={ref}
        style={customStyle?.inputForm}
      >
        <input
          type='text'
          value={fromDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onInputChange('FROM', e);
          }}
          onClick={onOpenCalendar}
          placeholder={t ? t(fromPlaceholder) : fromPlaceholder}
          readOnly={isReadonly}
          disabled={isDisable}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (
              e.key === 'ArrowRight' &&
              (e.target as HTMLInputElement).selectionStart === 10
            ) {
              const container = (ref as RefObject<HTMLDivElement>).current;
              if (container) {
                const toInput = container.childNodes[2] as HTMLInputElement;
                toInput.focus();
                toInput.setSelectionRange(0, 0);
              }
              e.preventDefault();
            }
          }}
          style={customStyle?.inputFont}
        />
        <span>~</span>
        <input
          type='text'
          value={toDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onInputChange('TO', e);
          }}
          onClick={onOpenCalendar}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (toDate === '' && e.key === 'Backspace') {
              const container = (ref as RefObject<HTMLDivElement>).current;
              if (container) {
                (container.childNodes[0] as HTMLInputElement).focus();
              }
              return;
            }
            if (
              e.key === 'ArrowLeft' &&
              (e.target as HTMLInputElement).selectionStart === 0
            ) {
              const container = (ref as RefObject<HTMLDivElement>).current;
              if (container) {
                const fromInput = container.childNodes[0] as HTMLInputElement;
                fromInput.focus();
                fromInput.setSelectionRange(
                  fromInput.value.length,
                  fromInput.value.length,
                );
              }
              e.preventDefault();
            }
          }}
          placeholder={t ? t(toPlaceholder) : toPlaceholder}
          readOnly={isReadonly}
          disabled={isDisable}
          style={customStyle?.inputFont}
        />
      </div>
    );
  },
);

DateRangePickerInput.defaultProps = {
  customStyle: undefined,
  t: undefined,
};

export default DateRangePickerInput;
