import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

// module
import { setTheme } from '@src/store/modules/theme';
import { theme as tm } from '@src/utils/utils';

function useTheme() {
  const dispatch = useDispatch();
  const theme = useMemo(() => localStorage.getItem('theme'), []);

  const onChangeTheme = () => {
    const theme = localStorage.getItem('theme');
    if (theme) {
      const curTheme =
        theme === tm.PRIMARY_THEME ? tm.DARK_THEME : tm.PRIMARY_THEME;
      localStorage.setItem('theme', curTheme);
      dispatch(setTheme(curTheme));
    } else {
      localStorage.setItem('theme', tm.DARK_THEME);
      dispatch(setTheme(tm.DARK_THEME));
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', tm.DARK_THEME);
      dispatch(setTheme(tm.DARK_THEME));
      return;
    }
    dispatch(setTheme(theme));
  }, [dispatch, theme]);

  return { onChangeTheme };
}

export default useTheme;
