import styles from './StopAutoLabelingModalContent.module.scss';
import classNames from 'classnames/bind';
import { Mypo, Sypo } from '@src/components/atoms/Typography/Typo';
import { MONO204 } from '@src/utils/color';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

const StopAutoLabelingModalContent = () => {
  const { t } = useT();
  return (
    <div className={cx('content-container')}>
      <div className={cx('title')}>
        <Sypo type='H2'>{t(`modal.stopAutolabeling.mainText`)}</Sypo>
      </div>
      <div className={cx('desc')}>
        <Mypo type='H4' weight='B' color={MONO204}>
          {t(`modal.stopAutolabeling.subText`)}
        </Mypo>
      </div>
    </div>
  );
};

export default StopAutoLabelingModalContent;
