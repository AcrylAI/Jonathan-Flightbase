import styles from './ClassSettingNodata.module.scss';
import classNames from 'classnames/bind';
import { Sypo } from '@src/components/atoms/Typography/Typo';

const cx = classNames.bind(styles);

type ClassSettingNodataProps = {
  desc: string;
};
const ClassSettingNodata = ({ desc }: ClassSettingNodataProps) => {
  return (
    <div className={cx('nodata-container')}>
      <div className={cx('desc')}>
        <Sypo type='H4' weight='regular'>
          {desc}
        </Sypo>
      </div>
    </div>
  );
};

export default ClassSettingNodata;
