// i18n
import { Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import { XSquareIcon } from '@src/static/images';

import styles from './ProjectInfoForm.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  isOwner: boolean;
};

const NotConnectedDataset = ({ isOwner }: Props) => {
  const { t } = useT();

  return (
    <div className={cx('not-connected-container')}>
      <div className={cx('not-connected-wrapper')}>
        <img src={XSquareIcon} alt='' />
        <div className={cx('text-section')}>
          <p>
            <Sypo type='P1' weight={500}>
              {t(`page.projectInfo.emptyDataset`)}
            </Sypo>
          </p>
          {isOwner && (
            <div className={cx('second-text-section')}>
              <Sypo type='P1' weight={400}>
                <p>{t(`page.projectInfo.emptyDatasetSub1`)}</p>
              </Sypo>
              <Sypo type='P1' weight={400}>
                <p>{t(`page.projectInfo.emptyDatasetSub2`)}</p>
              </Sypo>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotConnectedDataset;
