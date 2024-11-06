import { forwardRef, useEffect } from 'react';
import i18n from 'react-i18next';
import { Properties as CSSProperties } from 'csstype';

// Components
import Button from '@src/components/atoms/button/Button';

import { CalendarType, initCalendarSize } from '../types';

// SubComponents
import Calendar from './Calendar';

// CSS module
import classNames from 'classnames/bind';
import style from './DateRangePickerCalendar.module.scss';
const cx = classNames.bind(style);

type Props = {
  today: string;
  fromCalendarDate: string;
  toCalendarDate: string;
  selectedFromDate: string;
  selectedToDate: string;
  minDate: string;
  maxDate: string;
  calendarSize: string;
  fromValidation: boolean;
  toValidation: boolean;
  submitLabel: string;
  cancelLabel: string;
  fromCalendarTable: string[][];
  toCalendarTable: string[][];
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel: () => void;
  onChangeCalendar: (
    calendarType: CalendarType,
    movePos: 'BACK' | 'FRONT',
  ) => void;
  onSelectDate: (date: string, calendarType: CalendarType) => void;
  onCellRender?: (d: any, propItem: { [key: string]: any }) => React.ReactNode;
  onCalendarMount?: () => void;
  t?: i18n.TFunction<'translation'>;
};

const DateRangePickerCalendar = forwardRef<HTMLDivElement, Props>(
  (
    {
      today,
      fromCalendarDate,
      toCalendarDate,
      selectedFromDate,
      selectedToDate,
      minDate,
      maxDate,
      calendarSize,
      fromValidation,
      toValidation,
      submitLabel,
      cancelLabel,
      fromCalendarTable,
      toCalendarTable,
      onSubmit,
      onCancel,
      onSelectDate,
      onChangeCalendar,
      onCellRender,
      onCalendarMount,
      t,
    },
    ref,
  ) => {
    const buttonFontSize = (): CSSProperties => {
      switch (calendarSize) {
        case initCalendarSize.LARGE:
          return {
            fontSize: '16px',
            height: '40px',
          };
        case initCalendarSize.MEDIUM:
          return {
            fontSize: '14px',
            height: '36px',
          };
        case initCalendarSize.SMALL:
          return {
            fontSize: '12px',
            height: '32px',
          };
        case initCalendarSize.XSMALL:
          return {
            fontSize: '11px',
            height: '28px',
          };
        default:
          return {
            fontSize: '14px',
            height: '16px',
          };
      }
    };

    /**
     * calendar mount 감지
     */
    useEffect(() => {
      if (onCalendarMount) {
        onCalendarMount();
      }
    }, [onCalendarMount]);

    return (
      <div ref={ref} className={cx('date-range-picker-calendar', calendarSize)}>
        <div className={cx('calendar-area')}>
          <Calendar
            calendarType='FROM'
            today={today}
            selectedFromDate={selectedFromDate}
            selectedToDate={selectedToDate}
            fromCalendarDate={fromCalendarDate}
            toCalendarDate={toCalendarDate}
            minDate={minDate}
            maxDate={maxDate}
            calendarSize={calendarSize}
            calendarTable={fromCalendarTable}
            onSelectDate={onSelectDate}
            onChangeCalendar={onChangeCalendar}
            onCellRender={onCellRender}
          />
          <Calendar
            calendarType='TO'
            today={today}
            selectedFromDate={selectedFromDate}
            selectedToDate={selectedToDate}
            fromCalendarDate={fromCalendarDate}
            toCalendarDate={toCalendarDate}
            minDate={minDate}
            maxDate={maxDate}
            calendarSize={calendarSize}
            calendarTable={toCalendarTable}
            onSelectDate={onSelectDate}
            onChangeCalendar={onChangeCalendar}
            onCellRender={onCellRender}
          />
        </div>
        <div className={cx('btn', calendarSize)}>
          <Button
            type='none-border'
            onClick={onCancel}
            customStyle={buttonFontSize()}
          >
            {t ? t(cancelLabel) : cancelLabel}
          </Button>
          <Button
            disabled={!fromValidation || !toValidation}
            onClick={onSubmit}
            customStyle={buttonFontSize()}
          >
            {t ? t(submitLabel) : submitLabel}
          </Button>
        </div>
      </div>
    );
  },
);

DateRangePickerCalendar.defaultProps = {
  onCellRender: undefined,
  onCalendarMount: undefined,
  t: undefined,
};

export default DateRangePickerCalendar;
