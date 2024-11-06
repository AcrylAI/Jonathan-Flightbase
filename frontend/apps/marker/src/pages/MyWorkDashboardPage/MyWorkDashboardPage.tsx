import { useEffect } from 'react';
// Router
import { useParams } from 'react-router-dom';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import _ from 'lodash';

import { MyWorkDashboardPageAtom } from '@src/stores/components/pageContents/MyWorkDashboardPageAtom';

// Components
import MyWorkDashboardContents from '@src/components/pageContents/MyWorkDashboardContents/MyWorkDashboardContents';

import useGetProjectMetaData, {
  useGetProjectMetaDataResponseModel,
} from '@src/hooks/Api/useGetProjectMetaData';
// fetch hooks
import useTransfer from '@src/hooks/Common/useTransfer';

import useGetMyWorkOverview, {
  MyWorkDashboardResponseModel,
} from './hooks/useGetMyWorkOverview';

function MyWorkDashboardPage() {
  const { pid } = useParams();

  const { projectMetaData } = useRecoilValue<MyWorkDashboardPageAtom.ProjectDashboardPageAtomModel>(MyWorkDashboardPageAtom.projectDashboardPageAtom)
  const setMyWorkDashboardAtom =
    useSetRecoilState<MyWorkDashboardPageAtom.ProjectDashboardPageAtomModel>(
      MyWorkDashboardPageAtom.projectDashboardPageAtom,
    );
  const myWorkDashboardReset = useResetRecoilState(
    MyWorkDashboardPageAtom.projectDashboardPageAtom,
  );

  const { moveToLabeling, moveToReview } = useTransfer();

  const getProjectMetaData = (result: useGetProjectMetaDataResponseModel) => {
    setMyWorkDashboardAtom((myWorkDashboardAtom) => {
      const newMetaData = _.cloneDeep(myWorkDashboardAtom);
      newMetaData.projectMetaData = result;
      return newMetaData;
    });
  };

  const getMyWorkOverviewData = (result: MyWorkDashboardResponseModel) => {
    setMyWorkDashboardAtom((myWorkDashboardAtom) => {
      const newState = _.cloneDeep(myWorkDashboardAtom);
      newState.pageData = result;
      return newState;
    });
  };

  useGetProjectMetaData(
    { projectId: Number(pid) },
    { getData: getProjectMetaData },
  );
  useGetMyWorkOverview(
    { projectId: Number(pid) },
    {
      getData: getMyWorkOverviewData,
    },
  );

  const onClickLabeling = async () => {
    if (!pid) return;
    await moveToLabeling(pid, projectMetaData.type);
  };

  const onClickJobReview = async () => {
    if (!pid) return;
    await moveToReview(pid, projectMetaData.type);
  };

  useEffect(() => {
    return () => myWorkDashboardReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MyWorkDashboardContents
      onClickLabeling={onClickLabeling}
      onClickJobReview={onClickJobReview}
    />
  );
}

export default MyWorkDashboardPage;
