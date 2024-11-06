/* eslint-disable jsx-a11y/anchor-is-valid */
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import UserSetting from './components/UserSetting';
import LangSetting from './components/LangSetting';

// shared
import { AUTH_STRING } from '@src/shared/globalDefine';

// Style
import styles from './Header.module.scss';
import className from 'classnames/bind';

const cx = className.bind(styles);

// Image
const HeaderLogo = '/Images/logo/BI_Jonathan.svg';

function Header() {
  const { t } = useTranslation();
  const { status } = useSession();

  return (
    <div className={cx('header-container')}>
      <div className={cx('logo-box')}>
        <Link href='/' className={cx('logo-link')} passHref>
          <a>
            <Image
              className={cx('logo')}
              src={HeaderLogo}
              alt='Jonathan-Logo'
              width={155}
              height={30}
            />
          </a>
        </Link>
      </div>

      <div className={cx('authorization-box')}>
        {status === AUTH_STRING ? (
          <>
            <UserSetting />
            <LangSetting />
          </>
        ) : (
          <div className={cx('first')}>
            <span
              onClick={() => {
                signIn();
              }}
            >
              {t('signin')}
            </span>
            {/* <Link href='/member/type'>{t('signup')}</Link> */}
            <Link href='/member/join-request'>
              <a>{t('request-to-join')}</a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
