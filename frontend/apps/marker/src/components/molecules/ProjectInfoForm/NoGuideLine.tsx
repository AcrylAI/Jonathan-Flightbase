import { When } from '@jonathan/react-utils';

import { Mypo, Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import { NoFileIcon } from '@src/static/images';

import styles from './ProjectInfoForm.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  isOwner: boolean;
};

const NoGuideLine = ({ isOwner }: Props) => {
  const { t } = useT();

  return (
    <div className={cx('no-guide-container')}>
      <div className={cx('no-guide-wrapper')}>
        <img src={NoFileIcon} alt='' />
        <div className={cx('text-section')}>
          <p>
            <Sypo type='P1' weight={500}>
              {t(`page.projectInfo.emptyGuideline`)}
            </Sypo>
          </p>
          <When condition={isOwner}>
            <div className={cx('second-text-section')}>
              <Sypo type='P1' weight={400}>
                <p>{t(`page.projectInfo.emptyGuidelineSub1`)} </p>
              </Sypo>
              <Sypo type='P1' weight={400}>
                <p>{t(`page.projectInfo.emptyGuidelineSub2`)}</p>
              </Sypo>
            </div>
          </When>
        </div>
      </div>
    </div>
  );
};

export default NoGuideLine;
