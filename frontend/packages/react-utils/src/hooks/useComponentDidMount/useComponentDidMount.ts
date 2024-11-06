import { useEffect, useRef } from 'react';

function useComponentDidMount(callback?: () => any) {
  const isMount = useRef(false);

  useEffect(() => {
    if (isMount.current === false) {
      if (typeof callback === 'function') callback();
      isMount.current = true;
    }
  }, [callback]);
}

export default useComponentDidMount;
