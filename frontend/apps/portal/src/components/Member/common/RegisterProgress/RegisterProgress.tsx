// i18n
import { useTranslation } from 'react-i18next';

// Components
import ProgressItem from './ProgressItem/ProgressItem';

// Style
import styles from './RegisterProgress.module.scss';
import className from 'classnames/bind';

const cx = className.bind(styles);

type RegisterProgressProps = {
  progress: number;
};

function RegisterProgress({ progress = 0 }: RegisterProgressProps) {
  const { t } = useTranslation();
  return (
    <div className={cx('rp-container')}>
      <ProgressItem
        progressNow={progress}
        progressIndex={1}
        text={t('term-agreement')}
      />
      <div className={cx('divider')} />
      <ProgressItem
        progressNow={progress}
        progressIndex={2}
        text={t('account-info')}
      />
      {/* <div className={cx("divider")}/>
            <ProgressItem progressNow={progress} progressIndex={3} text={"인증 메일 발송"}/> */}
    </div>
  );
}

export default RegisterProgress;
