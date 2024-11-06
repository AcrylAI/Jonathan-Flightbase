import { useState } from 'react';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

/**
 * 컴포넌트 mount때 한번만 실행할 함수
 * @param callback
 */
function useComponentDidMount(callback) {
  const [mount, setMount] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (mount === false) {
      setMount(true);
      const unmount = callback();

      return () => {
        if (unmount) {
          unmount();
        }
      };
    }
    return () => {};
  }, [callback, mount]);
}

export default useComponentDidMount;
