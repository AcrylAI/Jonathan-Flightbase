import Link from 'next/link';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import BasicTitle from '@components/Member/common/Header/BasicTitle';
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import BasicButton from '@components/common/Button/BasicButton';

// Style
import classNames from 'classnames/bind';
import styles from './index.module.scss';
const cx = classNames.bind(styles);

function SignUp() {
  const { t } = useTranslation();
  return (
    <div className={cx('login-wrap')}>
      <div className={cx('join-box')}>
        {/* 회원가입 헤더 */}
        <div className={cx('login-header-box')}>
          <div className={cx('title-box')}>
            <BasicTitle text='Sign Up'></BasicTitle>
          </div>
          <div className={cx('sub-title-box')}>
            <BasicSubTitle
              text={['register-type-subtitle1', 'register-type-subtitle2']}
            ></BasicSubTitle>
          </div>
        </div>

        {/* 이메일 회원가입 */}
        <div className={cx('email-btn-box')}>
          <Link href='/member/terms' passHref>
            <BasicButton
              type='email'
              text={t('register-with-email')}
            ></BasicButton>
          </Link>
        </div>

        {/* 로그인할 때 돌아가기 */}
        <div className={cx('redirect-login-box')}>
          <span>{t('already-signed')}</span>
          <Link href='/member'>{t('register-type-signin')}</Link>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
