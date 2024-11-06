import { useRouter } from 'next/router';
// i18n
import { useTranslation } from 'react-i18next';

// Components
import BasicTitle from '@components/Member/common/Header/BasicTitle';
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import SuccessButton from '@components/common/Button/SuccessButton';

// Style
import styles from './index.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

function Index() {
  const { t } = useTranslation();
  const router = useRouter();
  const onClickLogin = () => {
    router.push('/member');
  };
  const onClickRegister = () => {
    router.push('/member/admin-register');
  };
  return (
    <div className={cx('registerComplete')}>
      {/* 회원등록 헤더 */}
      <div className={cx('registerComplete__header')}>
        <div className={cx('registerComplete__header--main')}>
          <BasicTitle text='Register'></BasicTitle>
        </div>
        <div className={cx('registerComplete__header--sub')}>
          <BasicSubTitle
            text={['admin-register-finished-subtitle']}
          ></BasicSubTitle>
        </div>
      </div>

      <div className={cx('registerComplete__main')}>
        {/* 바디 */}
        <div className={cx('registerComplete-text-container')}>
          <p className={cx('text')}>{t('admin-register-finished-msg1')}</p>
          <p className={cx('text')}>{t('admin-register-finished-msg2')}</p>
        </div>

        <div className={cx('registerComplete__main-btn-box')}>
          <SuccessButton
            onClick={onClickLogin}
            text={t('go-to-login-test')}
          ></SuccessButton>
          <SuccessButton
            onClick={onClickRegister}
            text={t('go-to-register-member')}
          ></SuccessButton>
        </div>
      </div>
    </div>
  );
}

export default Index;
