/**
 * 객체 깊은 복사
 *
 * @param {object} obj 복사할 객체
 */
export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 숫자에 1000단위 콤마 넣기
 * @param {number} x 숫자
 */
export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

/**
 * 데이터 크기 변환 (Bytes to KB/MB/GB)
 *
 * @param {Number} bytes
 * @returns {string} size+unit(단위)
 */
export const convertByte = (bytes) => {
  let size = '';
  const KB = bytes / 1024;
  if (KB >= 1024) {
    const MB = KB / 1024;
    size = `${MB.toFixed(2)}MB`;
    if (MB >= 1024) {
      const GB = MB / 1024;
      size = `${GB.toFixed(2)}GB`;
    }
  } else {
    size = `${KB.toFixed(2)}KB`;
  }
  return size;
};
