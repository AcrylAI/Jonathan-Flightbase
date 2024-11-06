import {
  useEffect,
  useCallback,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import dayjs from 'dayjs';
import i18n from 'react-i18next';
import { Properties as CSSProperties } from 'csstype';

// Components
import DateRangePickerInput from './DateRangePickerInput';
import DateRangePickerSplitInput from './DateRangePickerSplitInput';
import DateRangePickerCalendar from './DateRangePickerCalendar';

// Hooks
import { useComponentDidMount } from '@src/hooks';

import {
  CalendarType,
  CustomStyleType,
  initInputSize,
  initDateRangePickerStatus,
  initCalendarSize,
  initDateRangePickerType,
} from './types';

// utils
import {
  MAXIMAL_TIME,
  MINIMAL_TIME,
  DATE_FORM,
  DATE_TIME_FORM,
  DATE_PATTERN,
} from '@src/utils/datetimeUtils';

import classNames from 'classnames/bind';
import style from './DateRangePicker.module.scss';
const cx = classNames.bind(style);

type Props = {
  type?: string;
  status?: string;
  inputSize?: string;
  calendarSize?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  from?: string;
  to?: string;
  maxDate?: string;
  minDate?: string;
  today?: string;
  submitLabel?: string;
  cancelLabel?: string;
  customStyle?: {
    primaryType?: CustomStyleType;
    splitType?: CustomStyleType;
    globalForm?: CSSProperties;
  };
  onErrorMessage?: (e: string) => void;
  onCellRender?: (d: any, propItem: { [key: string]: any }) => React.ReactNode;
  onSubmit?: (
    from: string,
    to: string,
    e?: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  onCalendarMount?: () => void;
  onCalendarChangeDetector?: (left: string, right: string) => void;
  scrollHandler?: () => void;
  t?: i18n.TFunction<'translation'>;
};

function DateRangePicker({
  type = initDateRangePickerType.PRIMARY,
  status = initDateRangePickerStatus.DEFAULT,
  inputSize = initInputSize.MEDIUM,
  calendarSize = initCalendarSize.MEDIUM,
  fromPlaceholder = '',
  toPlaceholder = '',
  isDisabled = false,
  isReadOnly = false,
  from = dayjs().format(DATE_FORM),
  to = dayjs().format(DATE_FORM),
  maxDate = MAXIMAL_TIME,
  minDate = MINIMAL_TIME,
  today = dayjs().format(DATE_FORM),
  submitLabel = 'submit',
  cancelLabel = 'cancel',
  customStyle,
  onErrorMessage,
  onCellRender,
  onSubmit,
  onCalendarMount,
  onCalendarChangeDetector,
  scrollHandler,
  t,
}: Props): JSX.Element {
  // from은 왼쪽 달력 to는 오른쪽 달력
  const inputRef = useRef<HTMLDivElement>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // submit 버튼 클릭 여부
  const [isSubmit, setIsSubmit] = useState(false);

  // 달력 켜기 / 끄기 옵션
  const [isOpenCalendar, setIsOpenCalendar] = useState(false);

  // input box에 보여지는 from, to 날짜
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate] = useState(to);

  // 선택되어있는 from, to 날짜 (미확정 데이터)
  const [selectedFromDate, setSelectedFromDate] = useState(from);
  const [selectedToDate, setSelectedToDate] = useState(to);

  // 달력 from, to 날짜
  const [fromCalendarDate, setFromCalendarDate] = useState(from);
  const [toCalendarDate, setToCalendarDate] = useState(to);

  const [prevFromDate, setPrevFromDate] = useState(dayjs().format(DATE_FORM));
  const [prevToDate, setPrevToDate] = useState(dayjs().format(DATE_FORM));

  // 달력 테이블
  const [fromCalendarTable, setFromCalendarTable] = useState<string[][]>([]);
  const [toCalendarTable, setToCalendarTable] = useState<string[][]>([]);

  // from날짜, to날짜 validation 체크
  const [fromValidation, setFromValidation] = useState(true);
  const [toValidation, setToValidation] = useState(true);

  /**
   * from이 to 이후 날짜일 경우 true
   * 정상 날짜 범위 false
   * @param from
   * @param to
   * @returns
   */
  const isSwitchDateRange = (from: string, to: string): boolean => {
    const fDate = dayjs(from);
    const tDate = dayjs(to);

    if (fDate.isAfter(tDate)) {
      return true;
    }
    return false;
  };

  /**
   * 입력 받은 날짜 변환
   * @param from
   * @param to
   * @returns
   */
  const checkDate = useCallback((from: string, to: string) => {
    if (isSwitchDateRange(from, to)) {
      return [to, from];
    }
    return [from, to];
  }, []);

  /**
   * 예외 사항 체크
   */
  const checkValidation = useCallback(
    (from: string, to: string) => () => {
      // from / to의 문자열 format이 양식과 맞지 않을 경우
      if (!DATE_PATTERN.test(from)) {
        setFromValidation(false);
        if (onErrorMessage)
          onErrorMessage(`${from}이 ${DATE_FORM} Form이 아닙니다.`);
      }
      if (!DATE_PATTERN.test(to)) {
        setToValidation(false);
        if (onErrorMessage)
          onErrorMessage(`${to}이 ${DATE_FORM} Form이 아닙니다.`);
      }
    },
    [onErrorMessage],
  );

  /**
   * 달력으로 출력할 배열 계산
   */
  const calculateCalendar = useCallback(
    (calendarType: CalendarType, date: string) => {
      // calendarType이 from일때 왼쪽 달력, 아닐경우 오른쪽 달력
      const isFrom = calendarType === 'FROM';

      const d = dayjs(date);

      // 이전달
      const prevMonth = dayjs(d).subtract(1, 'month');

      // 이전달의 마지막날
      const prevLastDay = prevMonth.endOf('month');

      // 이전달 마지막날의 요일
      const prevLastDayOfWeek = prevLastDay.day();

      // 달력에 출력할 날짜
      let curDate = `${prevLastDay.format('YYYY-MM')}-${
        Number(prevLastDay.format('DD')) - prevLastDayOfWeek
      }`;

      // 달력 배열
      const calendarObj: string[][] = [];

      // 달력 배열 공간확보 (1주차 ~ 6주차)
      for (let i = 0; i < 6; i++) {
        calendarObj[i] = [];
      }

      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 7; j++) {
          calendarObj[i][j] = curDate;
          curDate = dayjs(curDate).add(1, 'day').format(DATE_FORM);
        }
      }

      if (isFrom) {
        setFromCalendarTable(calendarObj);
      } else {
        setToCalendarTable(calendarObj);
      }
    },
    [],
  );

  /**
   * inputbox를 클릭할 경우 달력 open
   */
  const onOpenCalendar = (e?: React.MouseEvent<HTMLInputElement>) => {
    if (!isReadOnly && !isDisabled) {
      setIsOpenCalendar(true);
    }
    if (!isOpenCalendar && scrollHandler) {
      e?.stopPropagation();
      scrollHandler();
    }
  };

  /**
   * 보여지는 달력 설정
   * @param {'FROM' | 'TO'} calendarType 달력 타입
   * @param {'BACK' | 'FRONT'} movePos 이전, 이후 달력 변경
   */
  const onChangeCalendar = (
    calendarType: CalendarType,
    movePos: 'BACK' | 'FRONT',
  ) => {
    const isFrom = calendarType === 'FROM';
    const isMoveBack = movePos === 'BACK';
    const date = isFrom ? dayjs(fromCalendarDate) : dayjs(toCalendarDate);
    const movedDate = isMoveBack
      ? date.subtract(1, 'month').format(DATE_FORM)
      : date.add(1, 'month').format(DATE_FORM);
    if (isFrom) {
      setFromCalendarDate(movedDate);
    } else {
      setToCalendarDate(movedDate);
    }
    calculateCalendar(calendarType, movedDate);
  };

  const calendarHandler = (type: CalendarType, date: string) => {
    if (type === 'FROM') {
      if (
        dayjs(fromCalendarDate).format('YYYYMM') !==
        dayjs(date).format('YYYYMM')
      ) {
        setFromCalendarDate(date);
        calculateCalendar(type, date);
      }
    } else {
      if (
        dayjs(toCalendarDate).format('YYYYMM') !== dayjs(date).format('YYYYMM')
      ) {
        setToCalendarDate(date);
        calculateCalendar(type, date);
      }
    }
  };

  /**
   * 날짜 선택
   * @param {string} date 클릭된 날짜
   */
  const onSelectDate = (date: string, calendarType: CalendarType) => {
    const filledDate = selectedFromDate !== '' && selectedToDate !== '';
    const nonFilledDate = selectedFromDate === '' && selectedToDate === '';
    const justFrom = selectedFromDate !== '' && selectedToDate === '';

    if (filledDate) {
      setFromDate(date);
      setSelectedFromDate(date);
      setToDate('');
      setSelectedToDate('');
      setFromValidation(true);
      setToValidation(false);

      calendarHandler(calendarType, date);
      return;
    }

    if (nonFilledDate) {
      setFromDate(date);
      setSelectedFromDate(date);
      setFromValidation(true);
      setToValidation(false);

      calendarHandler(calendarType, date);
      return;
    }

    if (justFrom) {
      if (isSwitchDateRange(selectedFromDate, date)) {
        setFromDate(date);
        setSelectedFromDate(date);
        setToDate(fromDate);
        setSelectedToDate(fromDate);
        setFromValidation(true);
        setToValidation(true);
      } else {
        setToDate(date);
        setSelectedToDate(date);
        setToValidation(true);
      }
    }
    calendarHandler(calendarType, date);
  };

  /**
   * input value 셋팅
   * @param {'FROM' | 'TO'} calendarType
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const onInputChange = (
    calendarType: CalendarType,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const input = e.target.value;
    if (input.length > 10) {
      return;
    }
    if (calendarType === 'FROM') {
      setFromDate(input);
      if (!DATE_PATTERN.test(input)) {
        // 입력된 form 체크
        setFromValidation(false);
        if (onErrorMessage)
          onErrorMessage(`${input}이 ${DATE_FORM} Form이 아닙니다.`);
        return;
      }
      if (isSwitchDateRange(input, toDate)) {
        setFromValidation(false);
        if (onErrorMessage)
          onErrorMessage(`${input}이 ${toDate} 이후 날짜입니다.`);
        return;
      }

      const iD = dayjs(input);
      const mD = dayjs(minDate);
      if (iD.isBefore(mD)) {
        if (onErrorMessage)
          onErrorMessage(`${input}이 ${minDate} 이전 날짜입니다.`);
        return;
      }

      setFromValidation(true);
      setSelectedFromDate(input);

      // from 달력 변경
      setFromCalendarDate(input);
      calculateCalendar(calendarType, input);

      return;
    }

    setToDate(input);
    // 입력된 form 체크
    if (!DATE_PATTERN.test(input)) {
      setToValidation(false);
      if (onErrorMessage)
        onErrorMessage(`${input}이 ${DATE_FORM} Form이 아닙니다.`);
      return;
    }

    if (isSwitchDateRange(fromDate, input)) {
      setToValidation(false);
      if (onErrorMessage)
        onErrorMessage(`${input}이 ${fromDate} 이전 날짜입니다.`);
      return;
    }

    const iD = dayjs(input);
    const mD = dayjs(maxDate);
    if (iD.isAfter(mD)) {
      if (onErrorMessage)
        onErrorMessage(`${input}이 ${maxDate} 이후 날짜입니다.`);
      return;
    }

    setToValidation(true);
    setSelectedToDate(input);

    // to 달력 변경
    setToCalendarDate(input);
    calculateCalendar(calendarType, input);
  };

  /**
   * from날짜, to날짜 calendar 렌더링 데이터 설정
   */
  const calendarRenderDateSet = useCallback(
    (from: string, to: string, checkValidation?: () => void) => {
      calculateCalendar('FROM', from);
      calculateCalendar('TO', to);
      if (checkValidation) checkValidation();
    },
    [calculateCalendar],
  );

  /**
   * cancel 버튼 클릭
   */
  const onCancel = useCallback(() => {
    setIsOpenCalendar(false);
    dateStateSet(prevFromDate, prevToDate);
    calendarRenderDateSet(prevFromDate, prevToDate);
    setFromValidation(true);
    setToValidation(true);
  }, [calendarRenderDateSet, prevFromDate, prevToDate]);

  /**
   * input 박스, 달력 영역 이외의 클릭이 감지될 경우
   */
  const onOutOfAreaClick = useCallback(
    (e: MouseEvent) => {
      if (
        isOpenCalendar &&
        !inputRef.current?.contains(e.target as Node) &&
        !fromInputRef.current?.contains(e.target as Node) &&
        !toInputRef.current?.contains(e.target as Node) &&
        !calendarRef.current?.contains(e.target as Node)
      ) {
        onCancel();
      }
    },
    [isOpenCalendar, onCancel],
  );

  /**
   * 날짜 상태 설정
   * @param from
   * @param to
   */
  const dateStateSet = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);

    setFromCalendarDate(from);
    setToCalendarDate(to);

    setSelectedFromDate(from);
    setSelectedToDate(to);
  };

  /**
   * 컴포넌트 마운트시 실행
   */
  const componentDidMount = useCallback(() => {
    const [f, t] = checkDate(from, to);
    calendarRenderDateSet(f, t, checkValidation(from, to));
  }, [checkDate, checkValidation, from, calendarRenderDateSet, to]);

  /**
   * 달력 날짜 Submit
   * @param e
   */
  const newSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsSubmit(true);

    if (onSubmit) {
      onSubmit(
        dayjs(selectedFromDate)
          .hour(0)
          .minute(0)
          .second(0)
          .format(DATE_TIME_FORM),
        dayjs(selectedToDate)
          .hour(23)
          .minute(59)
          .second(59)
          .format(DATE_TIME_FORM),
        e,
      );
    }

    setFromDate(selectedFromDate);
    setToDate(selectedToDate);

    setFromCalendarDate(selectedFromDate);
    setToCalendarDate(selectedToDate);

    setIsOpenCalendar(false);
  };

  /**
   * 영역 클릭 이벤트
   */
  useEffect(() => {
    document.addEventListener('click', onOutOfAreaClick);
    return () => {
      document.removeEventListener('click', onOutOfAreaClick);
    };
  }, [onOutOfAreaClick]);

  /**
   * 달력 변경 감지
   */
  useLayoutEffect(() => {
    if (onCalendarChangeDetector) {
      onCalendarChangeDetector(fromCalendarDate, toCalendarDate);
    }
  }, [fromCalendarDate, onCalendarChangeDetector, toCalendarDate]);

  /**
   * mount validation 체크
   */
  useLayoutEffect(() => {
    const [f, t] = checkDate(from, to);
    const min = dayjs(minDate);
    const max = dayjs(maxDate);

    dateStateSet(f, t);

    // minDate가 maxDate 이후 날짜일 경우
    if (max !== undefined && min.isAfter(max)) {
      setFromValidation(false);
      setToValidation(false);
      if (onErrorMessage)
        onErrorMessage(
          `최대 날짜 [${maxDate}]가 최소 날짜[${minDate}]보다 작습니다.`,
        );
    }
  }, [checkDate, from, maxDate, minDate, onErrorMessage, to]);

  /**
   * props에서 업데이트 된 날짜와 이전에 설정된 날짜가 다름
   * calendar 렌더링 데이터 재설정
   */
  useLayoutEffect(() => {
    if (isSubmit) {
      // submit 버튼 클릭시 날짜 바뀜 현상
      setIsSubmit(false);
    } else if (prevFromDate !== from || prevToDate !== to) {
      // submit 버튼을 누른게 아니면서 날짜가 바뀐 경우는 업데이트
      const [f, t] = checkDate(from, to);
      calendarRenderDateSet(f, t);
      setPrevFromDate(f);
      setPrevToDate(t);
    }
  }, [
    calendarRenderDateSet,
    from,
    prevFromDate,
    to,
    prevToDate,
    checkDate,
    isSubmit,
  ]);

  /**
   * 컴포넌트 mount 시 한번만 실행
   * calendar 렌더링 데이터 설정
   */
  useComponentDidMount(componentDidMount);

  return (
    <div
      className={cx('jp', 'date-range-picker')}
      style={customStyle?.globalForm}
    >
      <div
        className={cx(
          'input-box',
          type === initDateRangePickerType.SPLIT_INPUT && 'split-input',
        )}
      >
        {type === initDateRangePickerType.PRIMARY && (
          <DateRangePickerInput
            ref={inputRef}
            status={status}
            inputSize={inputSize}
            fromPlaceholder={fromPlaceholder}
            toPlaceholder={toPlaceholder}
            isReadonly={isReadOnly}
            isDisable={isDisabled}
            fromDate={fromDate}
            toDate={toDate}
            fromValidation={fromValidation}
            toValidation={toValidation}
            isOpenCalendar={isOpenCalendar}
            customStyle={customStyle?.primaryType}
            onInputChange={onInputChange}
            onOpenCalendar={onOpenCalendar}
            t={t}
          />
        )}
        {type === initDateRangePickerType.SPLIT_INPUT && (
          <>
            <DateRangePickerSplitInput
              ref={fromInputRef}
              calendarType='FROM'
              status={status}
              inputSize={inputSize}
              isReadOnly={isReadOnly}
              isDisabled={isDisabled}
              placeholder={fromPlaceholder}
              value={fromDate}
              isValidate={fromValidation}
              customStyle={customStyle?.splitType}
              onInputChange={onInputChange}
              onOpenCalendar={onOpenCalendar}
            />
            <DateRangePickerSplitInput
              ref={toInputRef}
              calendarType='TO'
              status={status}
              inputSize={inputSize}
              isReadOnly={isReadOnly}
              isDisabled={isDisabled}
              placeholder={toPlaceholder}
              value={toDate}
              isValidate={toValidation}
              customStyle={customStyle?.splitType}
              onInputChange={onInputChange}
              onOpenCalendar={onOpenCalendar}
            />
          </>
        )}
      </div>
      {isOpenCalendar && (
        <DateRangePickerCalendar
          ref={calendarRef}
          today={today}
          selectedFromDate={selectedFromDate}
          selectedToDate={selectedToDate}
          fromCalendarDate={fromCalendarDate}
          toCalendarDate={toCalendarDate}
          fromValidation={fromValidation}
          toValidation={toValidation}
          fromCalendarTable={fromCalendarTable}
          toCalendarTable={toCalendarTable}
          minDate={minDate}
          maxDate={maxDate}
          calendarSize={calendarSize}
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
          onSubmit={newSubmit}
          onCancel={onCancel}
          onSelectDate={onSelectDate}
          onChangeCalendar={onChangeCalendar}
          onCellRender={onCellRender}
          onCalendarMount={onCalendarMount}
          t={t}
        />
      )}
    </div>
  );
}

DateRangePicker.defaultProps = {
  type: initDateRangePickerType.PRIMARY,
  status: initDateRangePickerStatus.DEFAULT,
  inputSize: initInputSize.MEDIUM,
  calendarSize: initCalendarSize.MEDIUM,
  from: dayjs().format(DATE_FORM),
  to: dayjs().format(DATE_FORM),
  isDisabled: false,
  isReadOnly: false,
  fromPlaceholder: '',
  toPlaceholder: '',
  maxDate: MAXIMAL_TIME,
  minDate: MINIMAL_TIME,
  today: dayjs().format(DATE_FORM),
  submitLabel: 'submit',
  cancelLabel: 'cancel',
  customStyle: undefined,
  onErrorMessage: undefined,
  onCellRender: undefined,
  onSubmit: undefined,
  onCalendarMount: undefined,
  onCalendarChangeDetector: undefined,
  scrollHandler: undefined,
  t: undefined,
};

export default DateRangePicker;
