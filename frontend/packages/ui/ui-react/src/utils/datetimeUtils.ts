import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const DATE_FORM = 'YYYY-MM-DD';

export const DATE_TIME_FORM = 'YYYY-MM-DD HH:mm:ss';

export const MAXIMAL_TIME = '2099-12-31 23:59:59';

export const MINIMAL_TIME = '1900-01-01 00:00:00';

export const DATE_PATTERN =
  /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;

export const nowLocalTime = (format?: string) => {
  return dayjs()
    .local()
    .format(format || DATE_FORM);
};
