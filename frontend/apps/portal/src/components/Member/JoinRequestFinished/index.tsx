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
  const onClickHome = () => {
    router.push('/');
  };
  return (
    <div className={cx('registerComplete')}>
      {/* 회원가입 요청 헤더 */}
      <div className={cx('joinRequest__header')}>
        <div className={cx('joinRequest__header--main')}>
          <BasicTitle text='Request to Join'></BasicTitle>
        </div>
        <div className={cx('joinRequest__header--sub')}>
          <BasicSubTitle text={['register-type-subtitle1']}></BasicSubTitle>
        </div>
      </div>

      <div className={cx('registerComplete__main')}>
        {/* 바디 */}
        <div className={cx('registerComplete-text-container')}>
          <p className={cx('text')}>{t('register-request-finished-msg1')}</p>
          <p className={cx('text')}>{t('register-request-finished-msg2')}</p>
        </div>

        <div className={cx('registerComplete__main-btn-box')}>
          <SuccessButton
            onClick={onClickHome}
            text={t('back-to-home')}
          ></SuccessButton>
        </div>
      </div>
    </div>
  );
}

export default Index;
