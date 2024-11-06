import { useRouter } from 'next/router';
// i18n
import { useTranslation } from 'react-i18next';

// Components
import BasicTitle from '@components/Member/common/Header/BasicTitle';
import BasicSubTitle from '@components/Member/common/Header/BasicSubTitle';
import SuccessButton from '@components/common/Button/SuccessButton';
import RegisterProgress from '@components/Member/common/RegisterProgress/RegisterProgress';

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
  return (
    <div className={cx('registerComplete')}>
      {/* 회원가입 헤더 */}
      <div className={cx('registerComplete__header')}>
        <div className={cx('registerComplete__header--main')}>
          <BasicTitle text='Sign Up'></BasicTitle>
        </div>
        <div className={cx('registerComplete__header--sub')}>
          <BasicSubTitle
            text={['register-type-subtitle1', 'register-finished-subtitle']}
          ></BasicSubTitle>
        </div>
      </div>

      <RegisterProgress progress={3} />

      <div className={cx('registerComplete__main')}>
        {/* 바디 */}
        <div className={cx('registerComplete-text-container')}>
          <p className={cx('text')}>{t('register-finished-msg1')}</p>
          <p className={cx('text')}>{t('register-finished-msg2')}</p>
        </div>

        <div className={cx('registerComplete__main-btn-box')}>
          <SuccessButton
            onClick={onClickLogin}
            text={t('signin')}
          ></SuccessButton>
        </div>
      </div>
    </div>
  );
}

export default Index;
