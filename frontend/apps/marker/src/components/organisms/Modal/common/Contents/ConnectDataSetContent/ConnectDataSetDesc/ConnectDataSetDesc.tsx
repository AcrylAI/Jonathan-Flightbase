import styles from './ConnectDataSetDesc.module.scss';
import classNames from 'classnames/bind';
import { Mypo } from '@src/components/atoms';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

const ConnectDataSetDesc = () => {
  const { t } = useT();
  return (
    <div className={cx('desc-container')}>
      <Mypo type='H4' weight='medium'>
        {t(`modal.newProject.textConnectDataset`)}
        <br />
        {t(`modal.newProject.textReadFile`)}
        <br />
      </Mypo>
    </div>
  );
};

export default ConnectDataSetDesc;
