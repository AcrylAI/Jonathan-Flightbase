import { Sypo } from '@src/components/atoms';
import Tooltip from '@src/components/atoms/Tooltip/Tooltip';

import useT from '@src/hooks/Locale/useT';

import styles from './ConnectDataSetInfo.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type ConnectDataSetInfoProps = {
  type: number;
};
const ConnectDataSetInfo = ({ type }: ConnectDataSetInfoProps) => {
  const { t } = useT();
  const ProjectDataType: Array<string> = [
    `${t(`modal.newProject.image`)}`,
    `${t(`modal.newProject.text`)}`,
  ];

  return (
    <div className={cx('info-container')}>
      <div className={cx('title')}>
        <Sypo type='P1'>{t(`modal.newProject.projectDataType`)} :</Sypo>
      </div>
      <div className={cx('tooltip')}>
        <div className={cx('type')}>
          <Sypo type='P1' weight='bold'>
            {ProjectDataType[type]}
          </Sypo>
        </div>
        <Tooltip
          desc={`${t(`component.toolTip.fileExtensions`)}: ${
            type === 0 ? ' jpg, jpeg, png, webp' : ' txt'
          }`}
          direction='s'
        />
      </div>
    </div>
  );
};

export default ConnectDataSetInfo;
