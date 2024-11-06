import dayjs from 'dayjs';

// dayjs 플러그인
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';

/**
 * dayjs utc 플러그인 설정
 */
dayjs.extend(utc);

/**
 * dayjs duration 플러그인 설정
 */
dayjs.extend(duration);

export const DATE_FORM = 'YYYY-MM-DD';

export const DATE_TIME_FORM = 'YYYY-MM-DD HH:mm:ss';

/**
 * 현재 날짜
 */
export const TODAY = dayjs();
