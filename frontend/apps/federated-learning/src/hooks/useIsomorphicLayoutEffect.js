import { useEffect, useLayoutEffect } from 'react';

/**
 * useEffect, useLayoutEffect 사용 분기 설정
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
