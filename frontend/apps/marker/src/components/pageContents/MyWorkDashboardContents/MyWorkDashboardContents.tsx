import { useRecoilValue } from 'recoil';

import { MyWorkDashboardPageAtom } from '@src/stores/components/pageContents/MyWorkDashboardPageAtom';

import { Sypo } from '@src/components/atoms';

// Components
import { PageHeader } from '@src/components/molecules';

import useT from '@src/hooks/Locale/useT';

import InformationCard from './InformationCard/InformationCard';
import LabelingProgressCard from './LabelingProgressCard/LabelingProgressCard';

import style from './MyWorkDashboardContents.module.scss';
// CSS Module
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  onClickLabeling: () => void;
  onClickJobReview: () => void;
};

function MyWorkDashboardContents({ onClickJobReview, onClickLabeling }: Props) {
  const { t } = useT();
  const myWorkDashboardAtom =
    useRecoilValue<MyWorkDashboardPageAtom.ProjectDashboardPageAtomModel>(
      MyWorkDashboardPageAtom.projectDashboardPageAtom,
    );

  return (
    <div className={cx('mywork-dashboard')}>
      <PageHeader
        pageTitle={t('page.dashboardMyWork.myWork')}
        projectTitle
        projectTitleValue={myWorkDashboardAtom.projectMetaData.name}
        rightSection='workButton'
        onClickLabeling={onClickLabeling}
        onClickJobReview={
          myWorkDashboardAtom.projectMetaData.workflow
            ? onClickJobReview
            : undefined
        }
      />

      <div className={cx('contents-area')}>
        <LabelingProgressCard />
        <InformationCard />
      </div>
    </div>
  );
}

export default MyWorkDashboardContents;
