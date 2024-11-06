import { useRecoilValue } from 'recoil';

import { Button } from '@jonathan/ui-react';

import { AutoLabelingRunPageAtom } from '@src/stores/components/pageContents/AutoLabelingRunPageAtom';

import { Sypo } from '@src/components/atoms';

import { MONO204, MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import style from './ProgressContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  index: number;
  isProjectOwner: boolean;
  onClickStopAutolabeling: () => void;
};

function ProgressContents({
  index,
  isProjectOwner,
  onClickStopAutolabeling,
}: Props) {
  const { t } = useT();
  const autoLabelingRunPageAtom =
    useRecoilValue<AutoLabelingRunPageAtom.AutoLabelingRunPageAtomModel>(
      AutoLabelingRunPageAtom.autoLabelingRunPageAtom,
    );

  const { work, total } = autoLabelingRunPageAtom.autoLabelingRunList[index];

  return (
    <div className={cx('container')}>
      <div className={cx('column', 'progress')}>
        <div className={cx('label')}>
          <Sypo type='P1' color={MONO205}>
            {t('page.runAutolabeling.autolabelingInProgress')}
          </Sypo>
          <Sypo type='P1' color={MONO204}>
            {work.toLocaleString('kr')} / {total.toLocaleString('kr')}
          </Sypo>
        </div>
        <div className={cx('progress-bar')}>
          <div
            className={cx('body')}
            style={{
              width: `${Math.round((work / total) * 100)}%`,
            }}
          >
            <div
              className={cx('bar1')}
              style={{
                width: `${Math.round((work / total) * 100)}%`,
              }}
            ></div>
            <div className={cx('bar2')}></div>
          </div>
        </div>
      </div>
      <div className={cx('column')}>
        <Button
          type='primary-light'
          customStyle={{
            width: '64px',
          }}
          onClick={onClickStopAutolabeling}
          disabled={!isProjectOwner}
        >
          {t('component.btn.stop')}
        </Button>
      </div>
    </div>
  );
}

export default ProgressContents;
