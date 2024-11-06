import dayjs from 'dayjs';
import i18n from 'react-i18next';

// Types
import { CalendarType } from '../../types';

// Icons
import left from '@src/static/images/icons/ic-left.svg';
import right from '@src/static/images/icons/ic-right.svg';

// CSS Module
import classNames from 'classnames/bind';
import style from './Calendar.module.scss';
const cx = classNames.bind(style);

type Props = {
  calendarType: CalendarType;
  today: string;
  selectedFromDate: string;
  selectedToDate: string;
  fromCalendarDate: string;
  toCalendarDate: string;
  minDate: string;
  maxDate: string;
  calendarSize: string;
  calendarTable: string[][];
  readonly onChangeCalendar: (
    calendarType: CalendarType,
    movePos: 'BACK' | 'FRONT',
  ) => void;
  readonly onSelectDate: (date: string, calendarType: CalendarType) => void;
  readonly onCellRender?: (
    d: any,
    propItem: { [key: string]: any },
  ) => React.ReactNode;
  readonly t?: i18n.TFunction<'translation'>;
};

Calendar.defaultProps = {
  onCellRender: undefined,
  t: undefined,
};

function Calendar({
  calendarType,
  today,
  fromCalendarDate,
  toCalendarDate,
  selectedFromDate,
  selectedToDate,
  minDate,
  maxDate,
  calendarSize,
  calendarTable,
  onSelectDate,
  onChangeCalendar,
  onCellRender,
  t,
}: Props) {
  const isFrom = calendarType === 'FROM';
  const min = dayjs(minDate);
  const max = dayjs(maxDate);
  const from = dayjs(selectedFromDate);
  const to = selectedToDate !== '' && dayjs(selectedToDate);
  const calendar = isFrom ? dayjs(fromCalendarDate) : dayjs(toCalendarDate);
  const y = calendar.year();
  const m = calendar.month();

  return (
    <div className={cx('calendar-wrap', calendarSize, isFrom ? 'from' : 'to')}>
      <div className={cx('calendar-controller')}>
        <button
          className={cx('controll-btn', 'left')}
          onClick={() => {
            onChangeCalendar(calendarType, 'BACK');
          }}
        >
          <img src={left} alt='< button' />
        </button>
        <span className={cx('current-date')}>
          {String(y)}.{String(m + 1)}
        </span>
        <button
          className={cx('controll-btn', 'right')}
          onClick={() => {
            onChangeCalendar(calendarType, 'FRONT');
          }}
        >
          <img src={right} alt='> button' />
        </button>
      </div>
      <div className={cx('calendar')}>
        <div className={cx('grid', 'head')}>
          <span className={cx('head-cell')}>{t ? t('sun.label') : '일'}</span>
          <span className={cx('head-cell')}>{t ? t('mon.label') : '월'}</span>
          <span className={cx('head-cell')}>{t ? t('tue.label') : '화'}</span>
          <span className={cx('head-cell')}>{t ? t('thu.label') : '수'}</span>
          <span className={cx('head-cell')}>{t ? t('wed.label') : '목'}</span>
          <span className={cx('head-cell')}>{t ? t('fri.label') : '금'}</span>
          <span className={cx('head-cell')}>{t ? t('sat.label') : '토'}</span>
        </div>
        {calendarTable.map((week, i) => (
          <div className={cx('grid')} key={`${calendarType}-${i}`}>
            {week.map((calendarDate, j) => {
              let selectedClass = '';
              let fromClass = '';
              let toClass = '';
              let disabledClass = '';
              let thisMonthClass = '';
              let todayClass = '';
              let justFrom = '';
              let justTo = '';

              const calendarDateObj = dayjs(calendarDate);

              if (calendarDate === selectedFromDate) {
                fromClass = 'from';
                if (selectedToDate === '' && selectedFromDate) {
                  justFrom = 'just-from';
                }
              }

              if (calendarDate === selectedToDate) {
                toClass = 'to';
                if (selectedFromDate === '' && selectedToDate) {
                  justTo = 'just-to';
                }
              }

              // 오늘 날짜
              if (today === calendarDate) {
                todayClass = 'today';
              }

              // 선택된 기간 from 이후, to 이전 날짜
              if (to && from < calendarDateObj && to > calendarDateObj) {
                selectedClass = 'selected';
                todayClass = '';
              }

              // 최소 날짜 이전 달력 날짜
              if (min > calendarDateObj) {
                disabledClass = 'disabled';
              }

              // 최대 날짜 이후 달력 날짜
              if (max < calendarDateObj) {
                disabledClass = 'disabled';
              }

              // 현재 년월과 달력날짜의 년월이 일치
              if (
                y === calendarDateObj.year() &&
                m === calendarDateObj.month()
              ) {
                thisMonthClass = 'this-month';
              } else {
                selectedClass = '';
                fromClass = '';
                toClass = '';
                todayClass = '';
              }

              // jsx element rendering (Optional)
              if (onCellRender) {
                return (
                  <span className={cx('custom-cell')} key={`${i}-${j}`}>
                    {onCellRender(calendarDate, {
                      selected: !(selectedClass === ''),
                      from: !(fromClass === ''),
                      to: !(toClass === ''),
                      disabled: !(disabledClass === ''),
                      thisMonth: !(thisMonthClass === ''),
                      today: !(todayClass === ''),
                      onClick: () => {
                        if (disabledClass === '') {
                          onSelectDate(calendarDate, calendarType);
                        }
                      },
                    })}
                  </span>
                );
              }
              return (
                <span
                  key={`${i}-${j}`}
                  className={cx(
                    'cell',
                    selectedClass,
                    fromClass,
                    toClass,
                    justFrom,
                    justTo,
                    disabledClass,
                    thisMonthClass,
                    todayClass,
                  )}
                  onClick={() => {
                    if (disabledClass === '') {
                      onSelectDate(calendarDate, calendarType);
                    }
                  }}
                >
                  <span className={cx('inner-cell', fromClass, toClass)}>
                    {Number(dayjs(calendarDate).format('DD'))}
                  </span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
