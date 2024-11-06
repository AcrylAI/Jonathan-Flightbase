import dayjs from 'dayjs';
import { nowLocalTime } from '@src/utils/datetimeUtils';

import { theme } from '@src/utils';

// CSS Module
import classNames from 'classnames/bind';
import style from './Footer.module.scss';

const cx = classNames.bind(style);
const year = dayjs().year();

export interface FooterArgs {
  theme?: ThemeType;
  isOpen?: boolean;
  logoIcon?: any;
  copyrights?: string;
  updated?: string;
  language?: JSX.Element;
}

/**
 * Footer 컴포넌트
 */
function Footer({
  theme,
  isOpen,
  logoIcon: LogoIcon,
  copyrights,
  updated,
  language,
}: FooterArgs): JSX.Element {
  return (
    <div className={cx('footer', theme, isOpen && 'open')}>
      <div className={cx('box')}>
        <div className={cx('logo')}>
          {typeof LogoIcon === 'function' ? (
            <LogoIcon />
          ) : (
            <img
              src={
                LogoIcon ||
                'https://via.placeholder.com/143x29.png?text=Logo+143x29'
              }
              alt='Flightbase Logo'
            />
          )}
        </div>
        <div className={cx('items')}>
          <span className={cx('copyrights')}>{copyrights}</span>
          <span className={cx('updated')}>
            {updated && `Updated ${updated}`}
          </span>
          <div className={cx('language')}>{language}</div>
        </div>
      </div>
    </div>
  );
}

Footer.defaultProps = {
  theme: theme.PRIMARY_THEME,
  isOpen: false,
  logoIcon: undefined,
  copyrights: `© ${year} ACRYL inc. All rights reserved.`,
  updated: nowLocalTime('YYYY.MM.DD'),
  language: undefined,
};

export default Footer;
