import crypto from 'crypto-js';
import storeObj from './store/store';
import { expireToken } from '@src/store/modules/auth';
import { toast } from '@src/components/Toast';

// i18n
import i18n from 'i18next';

// export pdf
import html2canvas from 'html2canvas';
import jsPdf from 'jspdf';

/**
 * 객체 깊은 복사
 *
 * @param {object} obj 복사할 객체
 */
export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 문자열 첫번째 글자 대문자로 변경
 *
 * @param {string} s 변경할 문자열
 */
export const capitalizeFirstLetter = (s) => {
  return !s || typeof s !== 'string' || s.length <= 0
    ? s
    : s[0].toUpperCase() + s.slice(1);
};

/**
 * 문자열 각 단어 첫번째 글자 모두 대문자로 변경
 *
 * @param {string} s 변경할 문자열
 */
export const capitalizeFirstLetterAllWords = (s) => {
  if (!s || typeof s !== 'string' || s.length <= 0) {
    return s;
  } else {
    const words = s.split(' ');
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return words.join(' ');
  }
};

/**
 * 뒤로가기를 통해 이동했을 경우 이전 스크롤 위치로 이동
 */
export const scrollToPrevPosition = (path) => {
  const prevScrollPos = sessionStorage.getItem(`${path}_scroll_pos`);

  window.scrollTo(0, parseInt(prevScrollPos));
  // 현재스크롤 알아내고
  // 클릭했을때 sessionStorage에 저장
  // 페이지에 들어왔을때 비우기
  // sessionStorage.clear();
  // * 비우기

  // const position = sessionStorage.getItem('prev-scroll-pos');
  // const scrollBox = id ? document.getElementById(id) : window;
  // if (position && scrollBox) scrollBox.scrollTop = parseInt(position, 10);
};

Math.easeInOutQuad = (t, b, c, d) => {
  // eslint-disable-next-line no-param-reassign
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  // eslint-disable-next-line no-param-reassign
  t -= 1;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

/**
 * 스크롤 부드럽게 이동
 *
 * @param {object} element
 * @param {number} to
 * @param {number} duration
 */
export const scrollTo = (element, to, duration, isWindow) => {
  const start = element.scrollTop;
  const change = to - start;
  let currentTime = 0;
  const increment = 20;
  const animateScroll = () => {
    currentTime += increment;
    const val = Math.easeInOutQuad(currentTime, start, change, duration);

    if (isWindow) element.scrollTo(0, to);
    else element.scrollTop = val;

    if (currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };
  animateScroll();
};

const ENC_KEY = import.meta.env.VITE_REACT_APP_ENC_KEY;
const IV = import.meta.env.VITE_REACT_APP_IV;

console.log(ENC_KEY);
// ENC_KEY and IV can be generated as crypto.randomBytes(32).toString('hex');

/**
 * 암호화
 *
 * @param {string} val 암호화할 문자열
 */
export const encrypt = (val) => {
  /*
  vite 에서는 crypto 가 일렉트론에서의 호환성 문제때문에 사용불가
  crypto js로 변경
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
  let encrypted = cipher.update(val, 'utf8', 'base64');
  cipher += cipher.final('base64');
  return cipher;
  */

  const wordArray = crypto.enc.Utf8.parse(ENC_KEY);
  console.log(1, import.meta);
  console.log(2, import.meta.env);
  const iv = crypto.enc.Utf8.parse(IV);

  const cipher = crypto.AES.encrypt(val, wordArray, {
    iv,
    mode: crypto.mode.CBC,
    keySize: 256,
  });
  return cipher.toString();
};

/**
 * 복호화
 *
 * @param {string} encrypted 암호화된 문자열
 */
export const decrypt = (encrypted) => {
  /*
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
  const decrypted = decipher.update(encrypted, 'base64', 'utf8');
  return decrypted + decipher.final('utf8');
  vite 에서는 crypto 가 일렉트론에서의 호환성 문제때문에 사용불가
  crypto js로 변경
  */

  const wordArray = crypto.enc.Utf8.parse(ENC_KEY);
  const iv = crypto.enc.Utf8.parse(IV);
  const decipher = crypto.AES.decrypt(encrypted, wordArray, {
    iv,
    mode: crypto.mode.CBC,
    keySize: 256,
  });

  return decipher.toString(crypto.enc.Utf8);
};

/**
 * 만료 설정
 */
export const resetSession = () => {
  storeObj.store.dispatch(expireToken());
  sessionStorage.clear();
};

/**
 * 토큰 변경 설정
 *
 * @param {string} token 토큰
 */
export const refreshToken = (token) => {
  sessionStorage.setItem('token', token);
};

/**
 * 숫자에 1000단위 콤마 넣기
 * @param {number} x 숫자
 */
export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * PDF로 내보내기
 *
 * @param {string} id HTML tag ID
 */
export const exportPdf = (id) => {
  const input = document.getElementById(id);
  if (!id) {
    toast.error('tag id does not exists');
    return;
  }
  html2canvas(input).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const element = document.getElementById(id);
    const positionInfo = element.getBoundingClientRect();
    const divWidth = positionInfo.width;
    const divHeight = positionInfo.height;
    // eslint-disable-next-line new-cap
    const pdf = new jsPdf({
      orientation: 'horizontal',
      unit: 'mm',
      format: [divWidth, divHeight],
    });
    const ratio = divHeight / divWidth;
    const width = pdf.internal.pageSize.getWidth();
    let height = pdf.internal.pageSize.getHeight();
    height = ratio * width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`${id}.pdf`);
  });
};

/**
 * 정수 여부 확인
 *
 * @param {*} num int 타입 체크할 숫자
 */
export const intCheck = (num) => {
  return typeof num === 'number' && num % 1 === 0;
};

/**
 * 다양한 데이터 크기를 Bytes로 변환
 * @param {Number} value Bytes로 바꾸고 싶은 값
 * @param {String} unit value의 단위 Bytes | KB | MB | GB | TB | PB | EB | ZB | YB
 * @returns {Number} Bytes
 */
export const convertSizeToBytes = (value, unit) => {
  if (!isNaN(value)) {
    value = parseFloat(value);
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = units.indexOf(unit);
    return parseFloat(value * Math.pow(1000, i));
  }
  return value;
};

/**
 * 다양한 데이터 크기를 이진 Bytes로 변환
 * @param {Number} value Bytes로 바꾸고 싶은 값
 * @param {String} unit value의 단위 Bytes | KiB | MiB | GiB | TiB | PiB | EiB | ZiB | YiB
 * @returns {Number} Bytes
 */
export const convertSizeToBinaryBytes = (value, unit) => {
  if (!isNaN(value)) {
    value = parseFloat(value);
    const units = [
      'Bytes',
      'KiB',
      'MiB',
      'GiB',
      'TiB',
      'PiB',
      'EiB',
      'ZiB',
      'YiB',
    ];
    const i = units.indexOf(unit);
    return parseFloat(value * Math.pow(1024, i));
  }
  return value;
};

/**
 * 다양한 데이터 크기 변환
 * @param {Number} value 바꾸고 싶은 값
 * @param {String} unit value의 단위 Bytes | KiB | MiB | GiB | TiB | PiB | EiB | ZiB | YiB
 * @returns {Number} Bytes
 */
export const convertSizeTo = (value, unit) => {
  if (!isNaN(value)) {
    value = parseFloat(value);
    const units = [
      'Bytes',
      'KiB',
      'MiB',
      'GiB',
      'TiB',
      'PiB',
      'EiB',
      'ZiB',
      'YiB',
    ];
    const i = units.indexOf(unit);
    return `${parseFloat(value / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
  }
  return value;
};

/**
 * 데이터 크기 변환 (Bytes to KB/MB/GB/TB/PB/EB/ZB/YB)
 * @param {Number} bytes
 * @returns {string} size+unit(단위) 소수점 두자리까지 표기
 */
export const convertByte = (bytes) => {
  if (bytes === 0 || isNaN(bytes)) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1000));
  return `${parseFloat((bytes / Math.pow(1000, i)).toFixed(2))} ${units[i]}`;
};

/**
 * 데이터 크기 변환 이진방식 (Bytes to KiB/MiB/GiB/TiB/PiB/EiB/ZiB/YiB)
 * @param {Number} bytes
 * @returns {string} size+unit(단위) 소수점 두자리까지 표기
 */
export const convertBinaryByte = (bytes) => {
  if (bytes === 0 || isNaN(bytes)) return '0 Bytes';
  const units = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${units[i]}`;
};

/**
 * 데이터 크기 변환 (속도)
 * unit: bit => (bps to Kbps/Mbps/Gbps/Tbps/Pbps/Ebps/Zbps/Ybps)
 *       byte => (Bps to KBps/MBps/GBps/TBps/PBps/EBps/ZBps/YBps)
 * @param {Number} bps
 * @param {string} unit byte | bit(default)
 * @returns {string} size+unit(단위) 소수점 두자리까지 표기
 */
export const convertBps = (bps, unit = 'bit') => {
  let units = [
    'bps',
    'Kbps',
    'Mbps',
    'Gbps',
    'Tbps',
    'Pbps',
    'Ebps',
    'Zbps',
    'Ybps',
  ];
  if (unit.toLowerCase() === 'byte') {
    units = [
      'Bps',
      'KBps',
      'MBps',
      'GBps',
      'TBps',
      'PBps',
      'EBps',
      'ZBps',
      'YBps',
    ];
  }
  if (bps === 0 || isNaN(bps)) return '0 bps';
  const i = Math.floor(Math.log(bps) / Math.log(1000));
  return `${parseFloat((bps / Math.pow(1000, i)).toFixed(2))} ${units[i]}`;
};

/**
 * 오름차순 정렬
 * @param {Array} arr
 * @param {string} target
 * @returns {Array}
 */
export const sortAscending = (arr, target) => {
  return arr.sort((a, b) => {
    return a[target] - b[target];
  });
};

/**
 * 내림차순 정렬
 * @param {Array} arr
 * @param {string} target
 * @returns {Array}
 */
export const sortDescending = (arr, target) => {
  return arr.sort((a, b) => {
    return b[target] - a[target];
  });
};

/**
 * 빈 객체 검사
 * @param {*} param
 * @returns
 */
export function isEmptyObject(param) {
  return Object.keys(param).length === 0 && param.constructor === Object;
}

/**
 * 에러 토스트 메시지 생성
 * @param {object} error
 * @param {string} message
 * @returns
 *
 * example
 * error: {
 *    code: '001',
 *    location: 'datasets',
 *    options: {name: 'irene-test'},
 *  }
 * return toast.error(i18n.t('datasets.001.error.message', { name: 'irene-test' }));
 */
export function errorToastMessage(error, message) {
  if (error?.code && error?.location) {
    const { code, location } = error;
    // 메시지 안에 변수 있는 경우
    if (error?.options) {
      return toast.error(
        i18n.t(`${location}.${code}.error.message`, error.options),
      );
    }
    return toast.error(i18n.t(`${location}.${code}.error.message`));
  }
  // 기존 코드 대응
  if (message) {
    return toast.error(message);
  }
  // default message
  return toast.error(i18n.t('public.000.error.message'));
}

/**
 * 성공 토스트 메시지 생성
 * @param {object} success
 * @param {string} message
 * @returns
 */
export function successToastMessage(success, message) {
  if (success?.code && success?.location) {
    const { code, location } = success;
    // 메시지 안에 변수 있는 경우
    if (success?.options) {
      return toast.success(
        i18n.t(`${location}.${code}.success.message`, success.options),
      );
    }
    return toast.success(i18n.t(`${location}.${code}.success.message`));
  }
  // 기존 코드 대응
  if (message) {
    return toast.success(message);
  }
  // default message
  return toast.success(i18n.t('public.000.success.message'));
}

/**
 * 기본 성공 토스트 메시지
 * @param {string} type
 *  create | update | delete | upload | download |
 *  stop | run | clone | change | attach | detach | sync
 * @returns toast.success(i18n.t(`public.000.${type}.success.message`))
 */
export function defaultSuccessToastMessage(type) {
  return toast.success(i18n.t(`public.000.${type}.success.message`));
}

/**
 * 클립보드에 저장
 * @param {string} val 클립보드에 복사할 텍스트
 */
export const copyToClipboard = (val) => {
  const t = document.createElement('textarea');
  document.body.appendChild(t);
  t.value = val;
  t.select();
  document.execCommand('copy');
  document.body.removeChild(t);
};

/**
 * 포탈 페이지로 이동
 */
export const redirectToPortal = () => {
  // const currentLoc = window.location.href.replace('https://', '');
  const currentLoc = 'flightbase.acryl.ai';
  window.location.href = `${
    import.meta.env.VITE_REACT_APP_INTEGRATION_API_HOST
  }member/login?callbackUrl=${currentLoc}`;
};

/**
 * 주기적 함수 실행
 * @param {() => boolean} _f - 주기적으로 실행할 함수(boolean 값을 리턴하며 true면 )
 * @param {number} _t - 딜레이 시간
 * @returns {
 *  start: () => {},
 *  stop: () => {},
 *  setFunc: () => {},
 *  setDelay: () => {},
 *  setExcutionCallback: (isFirst: boolean) => {},
 * }
 *
 * @example
 * const instance = infiniteCall();
 *
 * const func = () => {};
 *
 * // 호출 함수 설정
 * instance.setFunc(func);
 *
 * // 딜레이 시간 설정
 * instance.setDelay(2000);
 *
 * // 함수 호출 후 실행되는 함수 설정
 * instance.setExcutionCallback((isFirst) => {
 *   // true면 인스턴스 생성 후 첫 호출
 *   console.log(isFirst);
 * });
 *
 * // 함수 호출 시작
 * instance.start();
 *
 * // 5초 뒤에 정지
 * setTimeout(() => { instance.stop(); }, 2000);
 *
 */
export function infiniteExcute(_f = () => false, _t = 1000) {
  let f = _f;
  let t = _t;
  let status = 'STOP';
  let isFirstExcution = true;
  let excutionCallback = () => {};
  const timer = (ms) => new Promise((res) => setTimeout(res, ms));

  /**
   * 딜레이 시간 setter 함수
   * @param {number} delay 딜레이 시간
   */
  function setDelay(delay) {
    t = delay;
  }

  /**
   * 주기적으로 호출할 함수 setter 함수 (boolean 값을 리턴하며 false면 주기 호출 정지)
   * @param {() => boolean} func 주기적으로 호출할 함수
   */
  function setFunc(func) {
    f = func;
  }

  function setExcutionCallback(func) {
    excutionCallback = func;
  }

  /**
   * 함수 주기 호출 시작
   *
   * setDelay함수를 통해 설정(setDelay 함수로 설정을 안할 경우 1초 마다)
   *
   * 한 시간 간격으로 setFunc을 통해 설정한 함수를 호출
   */
  async function start() {
    if (status === 'RUNNING') {
      // eslint-disable-next-line no-console
      return;
    }

    status = 'RUNNING';
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (status === 'STOP') break;

      // eslint-disable-next-line no-await-in-loop
      const result = await f();
      excutionCallback(isFirstExcution);
      isFirstExcution = false;

      // eslint-disable-next-line no-await-in-loop
      await timer(t);
      if (status === 'STOP') break;

      if (!result) {
        status = 'STOP';
        break;
      }
    }
  }

  /**
   * 함수 주기 호출 정지
   *
   * 주시적으로 실행 중이던 함수 호출 정지
   */
  function stop() {
    status = 'STOP';
  }

  return {
    start,
    stop,
    setFunc,
    setDelay,
    setExcutionCallback,
  };
}

export const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

/**
 * CamelCase로 변경
 *
 * @param {string} str
 * @returns
 */
export const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

/**
 * 배열을 translation string으로 반환
 * @param {string | string[]} value
 * @param {i18n.TFunction<'translation'>} t
 * @returns {string}
 */
export const arrayToTranslationString = (value, t) => {
  if (!value) return '';
  if (Array.isArray(value)) {
    let makeStr = '';
    value.forEach((val) => {
      makeStr = `${makeStr}${t ? t(val) : val}`;
    });
    return makeStr;
  }

  return t ? t(value) : value;
};

/**
 * minute정보 -> 경과 시간 계산
 * @param {number} minute
 * @returns {string}
 */
export const calcBeforeDateTime = (minute) => {
  let unit = '';
  let beforeTime = 0;
  if (minute === 0) {
    unit = 'justMoment';
  } else if (minute < 60) {
    unit = 'minute';
    beforeTime = minute;
  } else if (minute < 60 * 24) {
    unit = 'hour';
    beforeTime = Math.round(minute * 0.016);
  } else {
    unit = 'day';
    beforeTime = Math.round(minute * 0.00069);
  }

  return {
    unit,
    beforeTime,
  };
};

/**
 * 초를 s또는 ms으로 표시
 * @param {number} time
 * @returns {string}
 */
export const formatSecondsTime = (time) => {
  if (time >= 1) {
    return `${parseFloat(time.toFixed(3)).toString()}s`;
  }
  return `${parseFloat((time * 1000).toFixed(3)).toString()}ms`;
};

export const theme = {
  PRIMARY_THEME: 'jp-primary',
  DARK_THEME: 'jp-dark',
};
