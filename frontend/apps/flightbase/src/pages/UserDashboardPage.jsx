import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// Components
import UserDashboardContent from '@src/components/pageContents/user/UserDashboardContent';

// Utils
import { errorToastMessage } from '@src/utils';

// Actions
import { startPath } from '@src/store/modules/breadCrumb';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

function UserDashboardPage({ trackingEvent }) {
  // Router Hooks
  const history = useHistory();

  // Redux hooks
  const dispatch = useDispatch();

  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(false);

  /**
   * API 호출 GET
   * 사용자 대시보드 데이터 가져오기
   */
  const getDashboardData = async () => {
    setLoading(true);
    const response = await callApi({
      url: 'workspaces',
      method: 'GET',
    });

    const { result, status, message, error } = response;
    if (status === STATUS_SUCCESS) {
      let wslist = result.list;
      // 즐겨찾기, 만료 X 기준 정렬
      wslist = wslist.sort((prev, cur) => {
        if (
          prev.favorites > cur.favorites &&
          prev.status !== 'expired' &&
          cur.status !== 'expired'
        ) {
          return -1;
        } else {
          return 1;
        }
      });
      setData(wslist);
      setServerError(false);
    } else {
      errorToastMessage(error, message);
      setServerError(true);
    }
    setLoading(false);
  };

  /**
   * 새로고침
   */
  const onRefresh = () => {
    getDashboardData();
    trackingEvent({
      category: 'User Dashboard Page',
      action: 'Refresh Dashboard Data',
    });
  };

  /**
   * 워크스페이스 바로가기
   *
   * @param {number} workspace 워크스페이스 ID
   */
  const moveWorkspace = (workspace) => {
    trackingEvent({
      category: 'User Dashboard Page',
      action: 'Move To Workspace Home Page',
    });
    history.push({
      pathname: `workspace/${workspace.id}/home`,
      state: {
        id: workspace.id,
        name: workspace.name,
        loc: ['Home'],
      },
    });
  };

  useEffect(() => {
    dispatch(
      startPath([
        {
          component: {
            name: '',
          },
        },
      ]),
    );
    setLoading(true);
    getDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserDashboardContent
      data={data}
      loading={loading}
      onRefresh={onRefresh}
      moveWorkspace={moveWorkspace}
      serverError={serverError}
    />
  );
}

export default UserDashboardPage;
