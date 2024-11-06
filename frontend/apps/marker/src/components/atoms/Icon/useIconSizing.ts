import { useMemo } from 'react';
import { IconSize } from '@src/components/atoms/Icon/type';

/**
 * Icon에서 사용할 Sizing을 Memoization해서 retun해주는 Custom Hooks
 * @hooks
 * @author - Dawson
 * @version - 22-09-27
 */
function useIconSizing(size: IconSize) {
  return useMemo(() => {
    switch (size) {
      case 'large':
        return 36 - 2;
      case 'normal':
        return 24 - 2;
      case 'small':
        return 16 - 2;
      default:
        return undefined;
    }
  }, [size]);
}

export default useIconSizing;
