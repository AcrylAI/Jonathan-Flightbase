import { IconSize } from '@src/werkzeug/defs/components';

/**
 * Icon에서 사용할 Sizing을 Memoization해서 retun해주는 Custom Hooks
 * @author - Dawson
 * @version - 22-11-23
 */
function useIconSizing(size: IconSize) {
  const BORDERPAD = 2;
  
  return (() => {
    switch (size) {
      case "lx": return 36 - BORDERPAD;
      case "mx": return 24;
      case "sx": return 16;
      case "nx": return 12;
      default: return undefined;
    }
  })();
}

export default useIconSizing;
