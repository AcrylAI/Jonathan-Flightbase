import { useMemo, Fragment } from 'react';
import i18n from 'react-i18next';

// Components
import Nav from './Nav';

// Utils
import { theme } from '@src/utils';

// Icons
import IconDownloadBlue from '@src/static/images/icons/00-ic-data-download-blue.svg';

// CSS Module
import classNames from 'classnames/bind';
import style from './SideNav.module.scss';
const cx = classNames.bind(style);

export interface SideNavArgs {
  width?: number;
  responsive?: boolean;
  headerContents?: Array<JSX.Element>;
  theme?: ThemeType;
  navList?: Array<{ name: string; path: string; icon?: any; activeIcon?: any }>;
  mode?: string;
  isManual?: boolean;
  isHideManual?: boolean;
  onNavigate: ({
    element,
    path,
    isActive,
    activeClassName,
  }: {
    element: JSX.Element;
    path: string;
    isActive: (match: any) => boolean;
    activeClassName: string;
  }) => JSX.Element;
  onServiceManual?: (service: string) => void;
  footerRender?: () => JSX.Element;
  t?: i18n.TFunction<'translation'>;
}

interface styleType {
  width?: number;
}

/**
 * 사이드 네비게이션 컴포넌트
 */
function SideNav({
  width,
  responsive,
  headerContents,
  theme,
  navList,
  mode,
  isManual,
  isHideManual,
  onNavigate,
  footerRender,
  onServiceManual,
  t,
}: SideNavArgs) {
  const styleObj: styleType = useMemo(() => {
    const obj: styleType = {};
    if (width && !responsive) obj.width = width;
    return obj;
  }, [width, responsive]);
  return (
    <>
      <section className={cx('sidenav', theme)} style={styleObj}>
        <header className={cx('sidenav-header')}>
          {headerContents &&
            headerContents.map((ele, key) => (
              <Fragment key={key}>{ele}</Fragment>
            ))}
        </header>
        <nav className={cx('nav')}>
          <Nav navList={navList} theme={theme} onNavigate={onNavigate} t={t} />
        </nav>
        {footerRender ? (
          <footer>{footerRender()}</footer>
        ) : (
          (mode !== 'CUSTOM' || isManual) &&
          !isHideManual &&
          onServiceManual && (
            <footer className={cx('sidenav-footer')}>
              <div className={cx('manual-box')}>
                <button
                  className={cx('manual-download-btn')}
                  onClick={() => onServiceManual('Flightbase')}
                >
                  Service Manual
                  <img
                    className={cx('icon')}
                    src={IconDownloadBlue}
                    alt='download'
                  />
                </button>
              </div>
            </footer>
          )
        )}
      </section>
    </>
  );
}

SideNav.defaultProps = {
  width: undefined,
  responsive: false,
  headerContents: [],
  navList: [],
  mode: undefined,
  isManual: true,
  isHideManual: false,
  theme: theme.PRIMARY_THEME,
  onServiceManual: () => {},
  footerRender: undefined,
  t: undefined,
};

export default SideNav;
