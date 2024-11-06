import { RefObject, useEffect, useState } from 'react';

interface Args extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * intersection observer hook
 * @param elementRef
 * @param param1
 * @returns
 */
function useIntersectionObserver(
  elementRef: RefObject<Element>,
  {
    threshold = 0, // node 교차 영역 비율
    root = null, // 교차 영역의 기준 (observe 대상의 요소는 root의 하위 요소)
    rootMargin = '0%', // root 요소의 css margin
    freezeOnceVisible = false,
  }: Args,
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[], observer: any) => {
    setEntry(entry);
    observer.disconnect();
  };

  useEffect(() => {
    const node = elementRef?.current;

    // Intersection observer 지원 여부
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return undefined;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);
    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, frozen, root, rootMargin, threshold]);

  return entry;
}

export { useIntersectionObserver };
