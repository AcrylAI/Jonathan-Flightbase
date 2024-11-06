import { useState } from 'react';
import { Story } from '@storybook/react';
import dayjs from 'dayjs';

// Component
import DateRangePicker from './DateRangePicker';

// type
import {
  DateRangePickerArgs,
  initCalendarSize,
  initDateRangePickerType,
  initInputSize,
  initDateRangePickerStatus,
} from './types';

import { DATE_FORM } from '@src/utils/datetimeUtils';

export default {
  title: `UI KIT/Molecules/DateRangePicker`,
  component: DateRangePicker,
  parameter: {
    componentSubtitle: 'DateRangePicker 컴포넌트',
  },
  argTypes: {
    inputSize: {
      options: Object.values(initInputSize).map((size: string) => size),
      control: {
        type: 'radio',
      },
    },
    calendarSize: {
      options: Object.values(initCalendarSize).map((status: string) => status),
      control: {
        type: 'radio',
      },
    },
    type: {
      control: {
        disable: true,
      },
    },
    status: {
      options: Object.values(initDateRangePickerStatus).map(
        (status: string) => status,
      ),
      control: {
        type: 'select',
      },
    },
    t: {
      control: {
        disable: true,
      },
    },
    onSubmit: { action: '확인' },
  },
};

const DateRangePickerTemplate = (args: DateRangePickerArgs): JSX.Element => {
  const [from, setFrom] = useState(args.from);
  const [to, setTo] = useState(args.to);

  const onSubmit = (
    from: string,
    to: string,
    e?: React.MouseEvent<HTMLButtonElement>,
  ) => {
    // eslint-disable-next-line no-alert
    // alert(`from : ${from} ~ to : ${to}`);
    if (args.onSubmit) args.onSubmit(from, to, e);
    setFrom(dayjs(from).format(DATE_FORM));
    setTo(dayjs(to).format(DATE_FORM));
  };
  const onErrorMessage = (e: string) => {
    // eslint-disable-next-line no-console
    console.log(e);
  };

  return (
    <DateRangePicker
      {...args}
      from={from}
      to={to}
      onSubmit={onSubmit}
      onErrorMessage={onErrorMessage}
    />
  );
};

export const PrimaryDateRangePicker: Story<DateRangePickerArgs> =
  DateRangePickerTemplate.bind({});
PrimaryDateRangePicker.args = {
  type: initDateRangePickerType.PRIMARY,
  status: initDateRangePickerStatus.DEFAULT,
  inputSize: initInputSize.MEDIUM,
  calendarSize: initCalendarSize.MEDIUM,
  isDisabled: false,
  isReadOnly: false,
  fromPlaceholder: 'from',
  toPlaceholder: 'to',
  from: dayjs().subtract(10, 'day').format(DATE_FORM),
  to: dayjs().subtract(-10, 'day').format(DATE_FORM),
  maxDate: dayjs().subtract(-1, 'year').format(DATE_FORM),
  minDate: dayjs().subtract(1, 'year').format(DATE_FORM),
  today: dayjs().format(DATE_FORM),
  submitLabel: 'submit',
  cancelLabel: 'cancel',
  customStyle: {
    primaryType: {
      inputForm: {},
      inputFont: {},
    },
  },
};

export const SplitInputDateRangePicker: Story<DateRangePickerArgs> =
  DateRangePickerTemplate.bind({});
SplitInputDateRangePicker.args = {
  type: initDateRangePickerType.SPLIT_INPUT,
  status: initDateRangePickerStatus.DEFAULT,
  inputSize: initInputSize.MEDIUM,
  calendarSize: initCalendarSize.MEDIUM,
  isDisabled: false,
  isReadOnly: false,
  fromPlaceholder: 'from',
  toPlaceholder: 'to',
  from: dayjs().subtract(10, 'day').format(DATE_FORM),
  to: dayjs().subtract(-10, 'day').format(DATE_FORM),
  maxDate: dayjs().subtract(-1, 'year').format(DATE_FORM),
  minDate: dayjs().subtract(1, 'year').format(DATE_FORM),
  today: dayjs().format(DATE_FORM),
  submitLabel: 'submit',
  cancelLabel: 'cancel',
  customStyle: {
    splitType: {
      inputForm: {},
      inputFont: {},
    },
  },
};
