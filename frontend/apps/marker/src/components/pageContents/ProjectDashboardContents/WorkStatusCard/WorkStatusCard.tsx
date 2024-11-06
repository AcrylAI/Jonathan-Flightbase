import { useRecoilValue } from 'recoil';

import { ProjectDashboardPageAtom } from '@src/stores/components/pageContents/ProjectDashboardPageAtom';

import { Sypo } from '@src/components/atoms';

import DoubleLineChart from '@src/components/pageContents/ProjectDashboardContents/WorkStatusCard/DoubleLineChart/DoubleLineChart';
import RadialBarChart from '@src/components/pageContents/ProjectDashboardContents/WorkStatusCard/RadialBarChart';

import { MONO204, MONO205, MONO206 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import style from './WorkStatusCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function WorkStatusCard() {
  const { t } = useT();

  const projectDashboardAtom =
    useRecoilValue<ProjectDashboardPageAtom.ProjectDashboardPageAtomModel>(
      ProjectDashboardPageAtom.projectDashboardPageAtom,
    );

  return (
    <div className={cx('work-status-card')}>
      <div className={cx('title')}>
        <Sypo type='P1'>{t('page.dashboardProject.workStatus')}</Sypo>
      </div>
      <div className={cx('contents')}>
        <div className={cx('left-contents')}>
          <div className={cx('approved-labeling-cnt')}>
            <Sypo type='H1'>
              {projectDashboardAtom.workStatusGraph.doubleDonut.approvedLabeling.toLocaleString(
                'kr',
              )}
            </Sypo>
            <div className={cx('label')}>
              <Sypo type='P4' color={MONO205}>
                ({t('page.dashboardProject.approvedLabeling')})
              </Sypo>
            </div>
          </div>
          <div className={cx('pie-chart')}>
            <RadialBarChart
              tagId='work-status-radial-bar'
              customStyle={{
                width: '100%',
                height: '232px',
              }}
              data={{
                ...projectDashboardAtom.workStatusGraph.doubleDonut,
                innerData: [
                  {
                    category:
                      projectDashboardAtom.workStatusGraph.doubleDonut
                        .innerData[0].category,
                    value:
                      projectDashboardAtom.workStatusGraph.doubleDonut
                        .innerData[0].value,
                    name: t('page.dashboardProject.approvedLabeling'),
                  },
                  {
                    category:
                      projectDashboardAtom.workStatusGraph.doubleDonut
                        .innerData[1].category,
                    value:
                      projectDashboardAtom.workStatusGraph.doubleDonut
                        .innerData[1].value,
                    name: t('page.dashboardProject.workInProgress'),
                  },
                ],
                outerData: [
                  {
                    category:
                      projectDashboardAtom.workStatusGraph.doubleDonut
                        .outerData[0].category,
                    value:
                      projectDashboardAtom.workStatusGraph.doubleDonut
                        .outerData[0].value,
                    name: t('page.dashboardProject.submittedLabeling'),
                  },
                  {
                    category:
                      projectDashboardAtom.workStatusGraph.doubleDonut
                        .outerData[1].category,
                    value:
                      projectDashboardAtom.workStatusGraph.doubleDonut
                        .outerData[1].value,
                    name: t('page.dashboardProject.workInProgress'),
                  },
                ],
              }}
            />
            <div className={cx('legend')}>
              <div className={cx('legend-element')}>
                <div className={cx('mark', 'submitted')}></div>
                <Sypo type='P4' color={MONO204}>
                  {t('page.dashboardProject.submittedLabeling')}
                </Sypo>
                <Sypo type='P4' color={MONO206}>
                  {
                    projectDashboardAtom.workStatusGraph.doubleDonut
                      .submittedLabeling
                  }
                </Sypo>
              </div>
              <div className={cx('legend-element')}>
                <div className={cx('mark', 'approved')}></div>
                <Sypo type='P4' color={MONO204}>
                  {t('page.dashboardProject.approvedLabeling')}
                </Sypo>
                <Sypo type='P4' color={MONO206}>
                  {
                    projectDashboardAtom.workStatusGraph.doubleDonut
                      .approvedLabeling
                  }
                </Sypo>
              </div>
              <div className={cx('legend-element')}>
                <div className={cx('mark', 'work')}></div>
                <Sypo type='P4' color={MONO204}>
                  {t('page.dashboardProject.workInProgress')}
                </Sypo>
                <Sypo type='P4' color={MONO206}>
                  {
                    projectDashboardAtom.workStatusGraph.doubleDonut
                      .workInProgress
                  }
                </Sypo>
              </div>
            </div>
          </div>
        </div>
        <div className={cx('right-contents')}>
          <div className={cx('chart-area')}>
            <DoubleLineChart
              tagId='work-status-line-chart'
              data={{
                ...projectDashboardAtom.workStatusGraph.doubleLine,
                valueName1: t('page.dashboardProject.approvedLabeling'),
                valueName2: t('page.dashboardProject.submittedLabeling'),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkStatusCard;
