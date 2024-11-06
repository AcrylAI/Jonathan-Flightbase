/* eslint-disable react/no-unescaped-entities */
import { Mypo, Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import { FadersIcon } from '@src/static/images';

import styles from './AutoLabelingSetContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  isOwner: boolean;
};
const NoAutoLabelingSetContent = ({ isOwner }: Props) => {
  const { t } = useT();

  return (
    <div className={cx('no-auto-labeling-container')}>
      <div className={cx('no-auto-labeling-contents')}>
        <img src={FadersIcon} alt='' />
        <Sypo type='H4' weight={500}>
          <p className={cx('no-auto-labeling-text', 'first-line')}>
            {t(`page.autolabeling.noAutoLabeling`)}
          </p>
        </Sypo>
        {/* 프로젝트 오너라면 설정해달라는 문구 출력 */}
        {isOwner && (
          <Sypo type='H4' weight={400}>
            <p className={cx('no-auto-labeling-text')}>
              {t(`page.autolabeling.pleaseSetAutoLabeling`)}
            </p>
          </Sypo>
        )}
      </div>
    </div>
  );
};

export default NoAutoLabelingSetContent;
