import { useEffect, Fragment } from 'react';
import { theme } from '@src/utils';

// Custom Hooks
import useWindowDimensions from '@src/hooks/useWindowDimensions';

// CSS Module
import classNames from 'classnames/bind';
import style from './Header.module.scss';

const cx = classNames.bind(style);

export interface HeaderArgs {
  expandHandler?: () => void;
  hideMenuBtn?: boolean;
  theme?: ThemeType;
  leftBoxContents?: Array<JSX.Element>;
  rightBoxContents?: Array<JSX.Element>;
  isLogo?: boolean;
  logoIcon?: any;
}

/**
 * Header 컴포넌트
 */
function Header({
  expandHandler,
  hideMenuBtn,
  theme,
  leftBoxContents,
  rightBoxContents,
  isLogo,
  logoIcon: LogoIcon,
}: HeaderArgs): JSX.Element {
  useEffect(() => {}, []);

  // 화면 너비
  const { width } = useWindowDimensions();
  // 반응형 사이드 네비게이션 기준 너비
  const reponsiveWidth = 1200;

  return (
    <div className={cx('header', theme)}>
      {!hideMenuBtn && width <= reponsiveWidth && (
        <div className={cx('left-box')}>
          {/* 햄버거 버튼 */}
          <button
            id='side-menu-btn'
            data-testid='side-menu-btn'
            className={cx('menu-btn')}
            onClick={expandHandler}
          >
            <div className={cx('line-wrapper')}>
              <div className={cx('line')}></div>
              <div className={cx('line')}></div>
              <div className={cx('line')}></div>
            </div>
          </button>
        </div>
      )}
      {isLogo && (
        <div className={cx('left-box')}>
          <h1 className={cx('logo')}>
            <a href='/'>
              {typeof LogoIcon === 'function' ? (
                <LogoIcon />
              ) : (
                <img
                  className={cx('logo-img')}
                  src={LogoIcon}
                  alt='Flightbase Logo'
                />
              )}
            </a>
          </h1>
        </div>
      )}
      <div className={cx('center-box')}>
        {leftBoxContents &&
          leftBoxContents.map((ele, key) => (
            <Fragment key={key}>{ele}</Fragment>
          ))}
      </div>
      <div className={cx('right-box')}>
        {rightBoxContents &&
          rightBoxContents.map((ele, key) => (
            <Fragment key={key}>{ele}</Fragment>
          ))}
      </div>
    </div>
  );
}

Header.defaultProps = {
  expandHandler: () => {},
  hideMenuBtn: false,
  theme: theme.PRIMARY_THEME,
  leftBoxContents: [],
  rightBoxContents: [],
  isLogo: false,
  logoIcon: 'https://via.placeholder.com/134x32.png?text=Logo+Widthx32',
};

export default Header;
