import i18n from 'react-i18next';

/**
 * 문자열 배열을 문자열로 변경
 * @param value
 * @param t
 * @returns
 */
function arrayToString(
  value: string | string[],
  t?: i18n.TFunction<'translation'>,
): string {
  if (Array.isArray(value)) {
    let makeStr = '';
    value.forEach((val) => {
      makeStr = `${makeStr}${t ? t(val) : val}`;
    });
    return makeStr;
  }

  return t ? t(value) : value;
}

/**
 * intersection observer 설정
 * @param node Observing node
 * @param start 관찰될 경우 실행할 함수
 * @param pause 노드가 관찰되지 않을경우 실행할 함수
 */
function intersectionObserver<T, R>(
  node: Element,
  start?: () => T,
  pause?: () => R,
): () => void {
  const intersectionObserver = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        const { isIntersecting } = entry;
        if (isIntersecting) {
          if (typeof start === 'function') start();
        } else {
          if (typeof pause === 'function') pause();
        }
      });
    },
  );

  intersectionObserver.observe(node);

  return () => intersectionObserver.disconnect();
}

/**
 * Set<T> 비교
 * 같을 경우 true else false
 * @param beforeSet
 * @param afterSet
 * @returns boolean
 */
function isEqualSet<T>(beforeSet: Set<T>, afterSet: Set<T>): boolean {
  if (beforeSet.size !== afterSet.size) return false;

  // eslint-disable-next-line no-restricted-syntax
  for (const value of beforeSet) {
    if (!afterSet.has(value)) {
      return false;
    }
  }

  return true;
}

/**
 * 배열의 일치 여부 확인
 * 일치 시 true, 일치하지 않을경우 false
 * 타입이 2d-array ↑, set, map일 경우, 검출x
 * 타입이 object일때 key에 대한 순서가 보장되어있지 않으면 검출x
 * @param prev
 * @param next
 * @returns
 */
function isSameArray<T>(prev: Array<T>, next: Array<T>): boolean {
  if (prev.length !== next.length) return false;
  const len = prev.length;

  for (let i = 0; i < len; i++) {
    const p = prev[i];
    const n = next[i];

    if (typeof p !== typeof n) return false;
    if (typeof p === 'object' && JSON.stringify(p) !== JSON.stringify(n)) {
      return false;
    }
    if (prev[i] !== next[i]) return false;
  }
  return true;
}

/**
 * object 깊은 복사
 * object type이 아닐 경우 throw
 * @param obj
 * @returns
 */
function objectDeepCopy<T>(obj: T) {
  if (typeof obj !== 'object') throw new Error();
  return JSON.parse(JSON.stringify(obj));
}

const theme: {
  PRIMARY_THEME: 'jp-primary';
  DARK_THEME: 'jp-dark';
} = {
  PRIMARY_THEME: 'jp-primary',
  DARK_THEME: 'jp-dark',
};

export {
  arrayToString,
  intersectionObserver,
  isEqualSet,
  isSameArray,
  objectDeepCopy,
  theme,
};
