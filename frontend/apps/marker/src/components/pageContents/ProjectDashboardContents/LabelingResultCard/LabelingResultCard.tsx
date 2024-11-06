import { forwardRef } from 'react';
import { useRecoilValue } from 'recoil';

import { ProjectDashboardPageAtom } from '@src/stores/components/pageContents/ProjectDashboardPageAtom';

import { Sypo } from '@src/components/atoms';

import BarChart from '@src/components/molecules/charts/BarChart';

import useT from '@src/hooks/Locale/useT';

import style from './LabelingResultCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const LabelingResultCard = forwardRef<HTMLDivElement, unknown>((_, ref) => {
  const { t } = useT();
  const projectDashboardAtom =
    useRecoilValue<ProjectDashboardPageAtom.ProjectDashboardPageAtomModel>(
      ProjectDashboardPageAtom.projectDashboardPageAtom,
    );

  return (
    <div className={cx('labeling-result')}>
      <div className={cx('header')}>
        <Sypo type='P1'>{t('page.dashboardProject.labelingResult')}</Sypo>
      </div>
      <div className={cx('contents')} ref={ref}>
        <BarChart
          tagId='labeling-result-chart'
          chartHeight={300}
          customStyle={{
            width: '100%',
            height: '360px',
          }}
          min={0}
          data={{
            category: 'className',
            value: 'value',
            name: 'name',
            blockKey: 'deleted',
            xText: 'xText',
            data: projectDashboardAtom.pageData.workResult,
          }}
        />
      </div>
    </div>
  );
});

export default LabelingResultCard;
