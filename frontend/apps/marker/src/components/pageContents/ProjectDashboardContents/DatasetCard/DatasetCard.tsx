import { useRecoilValue } from 'recoil';

import { ProjectDashboardPageAtom } from '@src/stores/components/pageContents/ProjectDashboardPageAtom';

import { Sypo } from '@src/components/atoms';

import { MONO204, MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import style from './DatasetCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function DatasetCard() {
  const { t } = useT();

  const dashboardAtom =
    useRecoilValue<ProjectDashboardPageAtom.ProjectDashboardPageAtomModel>(
      ProjectDashboardPageAtom.projectDashboardPageAtom,
    );

  return (
    <div className={cx('data-set')}>
      <div className={cx('header')}>
        <Sypo type='P1'>{t('page.dashboardProject.dataset')}</Sypo>
      </div>
      <div className={cx('contents')}>
        <div>
          <Sypo type='P1' color={MONO204} weight='r'>
            {t('page.dashboardProject.datasetName')}
          </Sypo>
          <Sypo type='P1' color={MONO205}>
            {dashboardAtom.pageData.dataset.name
              ? dashboardAtom.pageData.dataset.name
              : '-'}
          </Sypo>
        </div>
        <div>
          <Sypo type='P1' color={MONO204} weight='r'>
            {t('page.dashboardProject.folderName')}
          </Sypo>
          <Sypo type='P1' color={MONO205}>
            {dashboardAtom.pageData.dataset.folderName
              ? dashboardAtom.pageData.dataset.folderName
              : '-'}
          </Sypo>
        </div>
        <div>
          <Sypo type='P1' color={MONO204} weight='r'>
            {t('page.dashboardProject.folderPath')}
          </Sypo>
          <Sypo type='P1' color={MONO205}>
            {dashboardAtom.pageData.dataset.folderPath
              ? dashboardAtom.pageData.dataset.folderPath
              : '-'}
          </Sypo>
        </div>
        <div>
          <Sypo type='P1' color={MONO204} weight='r'>
            {t('page.dashboardProject.dataCount')}
          </Sypo>
          <Sypo type='P1' color={MONO205}>
            {dashboardAtom.pageData.dataset.dataCnt
              ? dashboardAtom.pageData.dataset.dataCnt
              : '-'}
          </Sypo>
        </div>
      </div>
    </div>
  );
}

export default DatasetCard;
