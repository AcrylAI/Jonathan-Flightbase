import { useRecoilValue } from 'recoil';

import { ProjectDashboardPageAtom } from '@src/stores/components/pageContents/ProjectDashboardPageAtom';

import { Sypo } from '@src/components/atoms';
import DonutChart from '../DonutChart';

import { BLUE101, BLUE103, BLUE104, MONO202, MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import style from './DataStatusCard.module.scss';
import classNames from 'classnames/bind';

import { Color } from '@amcharts/amcharts5';

const cx = classNames.bind(style);

function DataStatusCard() {
  const { t } = useT();

  const projectDashboardAtom =
    useRecoilValue<ProjectDashboardPageAtom.ProjectDashboardPageAtomModel>(
      ProjectDashboardPageAtom.projectDashboardPageAtom,
    );

  return (
    <div className={cx('data-status')}>
      <div className={cx('header')}>
        <Sypo type='P1'>{t('page.dashboardProject.dataStatus')}</Sypo>
      </div>
      <div className={cx('contents')}>
        <DonutChart
          tagId='data-status-chart'
          legendVisible={false}
          data={{
            category: 'category',
            value: 'value',
            name: 'name',
            totalDataLabel: t('page.dashboardProject.connectedData'),
            totalData:
              projectDashboardAtom.pageData.dataInfo.total.toLocaleString('kr'),
            data: [
              {
                category: 'Unworked',
                value: projectDashboardAtom.pageData.dataInfo.notWork,
                name: t('page.dashboardProject.unworked'),
              },
              {
                category: 'Labeling in Progress',
                value: projectDashboardAtom.pageData.dataInfo.labeling,
                name: t('page.dashboardProject.labelingInProgress'),
              },
              {
                category: 'Review in Progress',
                value: projectDashboardAtom.pageData.dataInfo.review,
                name: t('page.dashboardProject.reviewInProgress'),
              },
              {
                category: 'Completed Autolabeling',
                value: projectDashboardAtom.pageData.dataInfo.complete,
                name: t('page.dashboardProject.completed'),
              },
            ],
          }}
          seriesColors={[
            MONO202 as unknown as Color,
            BLUE101 as unknown as Color,
            BLUE103 as unknown as Color,
            BLUE104 as unknown as Color,
          ]}
        />
        <div className={cx('progress-area')}>
          <div className={cx('autolabeling-total')}>
            <Sypo type='P2' color={MONO205}>
              {t('page.dashboardProject.completedAutolabeling')} :{' '}
            </Sypo>
            <Sypo type='P1' color={MONO205}>
              {projectDashboardAtom.pageData.dataInfo.autoLabeling.toLocaleString(
                'kr',
              )}
            </Sypo>
            <div className={cx('bar')}>
              <div
                style={{
                  width:
                    projectDashboardAtom.pageData.dataInfo.percent
                      .autoLabeling > 100
                      ? '100%'
                      : `${projectDashboardAtom.pageData.dataInfo.percent.autoLabeling}%`,
                }}
              ></div>
            </div>
          </div>
          <div className={cx('autolabeling-info')}>
            <div className={cx('unworked')}>
              <Sypo type='P2' color={MONO205}>
                {t('page.dashboardProject.unworked')} :{' '}
              </Sypo>
              <Sypo type='P1' color={MONO205}>
                {projectDashboardAtom.pageData.dataInfo.notWork.toLocaleString(
                  'kr',
                )}
              </Sypo>
              <div className={cx('bar')}>
                <div
                  style={{
                    width:
                      projectDashboardAtom.pageData.dataInfo.percent.notWork >
                      100
                        ? '100%'
                        : `${projectDashboardAtom.pageData.dataInfo.percent.notWork}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className={cx('labeling')}>
              <Sypo type='P2' color={MONO205}>
                {t('page.dashboardProject.labelingInProgress')} :{' '}
              </Sypo>
              <Sypo type='P1' color={MONO205}>
                {projectDashboardAtom.pageData.dataInfo.labeling.toLocaleString(
                  'kr',
                )}
              </Sypo>
              <div className={cx('bar')}>
                <div
                  style={{
                    width:
                      projectDashboardAtom.pageData.dataInfo.percent.labeling >
                      100
                        ? '100%'
                        : `${projectDashboardAtom.pageData.dataInfo.percent.labeling}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className={cx('review')}>
              <Sypo type='P2' color={MONO205}>
                {t('page.dashboardProject.reviewInProgress')} :{' '}
              </Sypo>
              <Sypo type='P1' color={MONO205}>
                {projectDashboardAtom.pageData.dataInfo.review.toLocaleString(
                  'kr',
                )}
              </Sypo>
              <div className={cx('bar')}>
                <div
                  style={{
                    width:
                      projectDashboardAtom.pageData.dataInfo.percent.review >
                      100
                        ? '100%'
                        : `${projectDashboardAtom.pageData.dataInfo.percent.review}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className={cx('completed')}>
              <Sypo type='P2' color={MONO205}>
                {t('page.dashboardProject.completed')} :{' '}
              </Sypo>
              <Sypo type='P1' color={MONO205}>
                {projectDashboardAtom.pageData.dataInfo.complete.toLocaleString(
                  'kr',
                )}
              </Sypo>
              <div className={cx('bar')}>
                <div
                  style={{
                    width:
                      projectDashboardAtom.pageData.dataInfo.complete > 100
                        ? '100%'
                        : `${projectDashboardAtom.pageData.dataInfo.percent.complete}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataStatusCard;
