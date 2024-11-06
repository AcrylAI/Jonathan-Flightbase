import i18n from 'react-i18next';
import { Properties as CSSProperties } from 'csstype';

interface DateRangePickerType {
  readonly PRIMARY: string;
  readonly SPLIT_INPUT: string;
}

interface DateRangePickerStatus {
  readonly DEFAULT: string;
  readonly ERROR: string;
}

interface DateRangePickerSizeType {
  readonly LARGE: string;
  readonly MEDIUM: string;
  readonly SMALL: string;
  readonly XSMALL: string;
}

interface CalendarSizeType {
  readonly LARGE: string;
  readonly MEDIUM: string;
  readonly SMALL: string;
  readonly XSMALL: string;
}

interface CustomStyleType {
  inputForm?: CSSProperties;
  inputFont?: {
    font?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    fontSize?: string;
  };
}

type CalendarType = 'FROM' | 'TO';

const initDateRangePickerStatus = {
  DEFAULT: 'default',
  ERROR: 'error',
};

const initInputSize: DateRangePickerSizeType = {
  LARGE: 'large',
  MEDIUM: 'medium',
  SMALL: 'small',
  XSMALL: 'x-small',
};

const initCalendarSize: CalendarSizeType = {
  LARGE: 'large',
  MEDIUM: 'medium',
  SMALL: 'small',
  XSMALL: 'x-small',
};

const initDateRangePickerType: DateRangePickerType = {
  PRIMARY: 'primary',
  SPLIT_INPUT: 'split-input',
};

interface DateRangePickerArgs {
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
  cellRenderProps?: { [key: string]: any };
  customStyle?: {
    primaryType?: CustomStyleType;
    splitType?: CustomStyleType;
    globalForm?: CSSProperties;
  };
  onCellRender?: (d: any, propItem: { [key: string]: any }) => React.ReactNode;
  onSelectDate?: (start?: string, end?: string) => void;
  onSubmit?: (
    from: string,
    to: string,
    e?: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  scrollHandler?: () => void;
  t?: i18n.TFunction<'translation'>;
}

export {
  DateRangePickerType,
  DateRangePickerStatus,
  DateRangePickerSizeType,
  CalendarSizeType,
  CalendarType,
  DateRangePickerArgs,
  CustomStyleType,
  initDateRangePickerStatus,
  initInputSize,
  initCalendarSize,
  initDateRangePickerType,
};
