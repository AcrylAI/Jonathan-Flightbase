import { lazy, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Route,
  Redirect,
  Switch,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';
import '@jonathan/ui-react/build/index.css';

// Template
import PageTemplate from '@src/components/templates/PageTemplate';

// Component
import TrackingHOC from '@src/hoc/TrackingHOC';

// Actions
import { closeAllModal } from '@src/store/modules/modal';

// Custom Hooks
import usePrevScroll from '@src/hooks/usePrevScroll';

// Icons
import IconLnbHomeBlue from '@src/static/images/nav/icon-lnb-home-blue.svg';
import IconLnbHomeGray from '@src/static/images/nav/icon-lnb-home-gray.svg';
import IconLnbDockerBlue from '@src/static/images/nav/icon-lnb-dockerimage-blue.svg';
import IconLnbDockerGray from '@src/static/images/nav/icon-lnb-dockerimage-gray.svg';
import IconLnbDatasetsBlue from '@src/static/images/nav/icon-lnb-dataset-blue.svg';
import IconLnbDatasetsGray from '@src/static/images/nav/icon-lnb-dataset-gray.svg';
import IconLnbTrainingsBlue from '@src/static/images/nav/icon-lnb-training-blue.svg';
import IconLnbTrainingsGray from '@src/static/images/nav/icon-lnb-training-gray.svg';
import IconLnbWorkbenchBlue from '@src/static/images/nav/icon-lnb-workbench-blue.svg';
import IconLnbWorkbenchGray from '@src/static/images/nav/icon-lnb-workbench-gray.svg';
import IconLnbFederatedLearningBlue from '@src/static/images/nav/icon-lnb-federatedLearning-blue.svg';
import IconLnbFederatedLearningGray from '@src/static/images/nav/icon-lnb-federatedLearning-gray.svg';
import IconLnbInformationBlue from '@src/static/images/nav/icon-lnb-information-blue.svg';
import IconLnbInformationGray from '@src/static/images/nav/icon-lnb-information-gray.svg';
import IconLnbServingBlue from '@src/static/images/nav/icon-lnb-serving-blue.svg';
import IconLnbServingGray from '@src/static/images/nav/icon-lnb-serving-gray.svg';
import IconLnbWorkerBlue from '@src/static/images/nav/icon-lnb-worker-blue.svg';
import IconLnbWorkerGray from '@src/static/images/nav/icon-lnb-worker-gray.svg';
import IconLnbDashboardBlue from '@src/static/images/nav/icon-lnb-dashboard-blue.svg';
import IconLnbDashboardGray from '@src/static/images/nav/icon-lnb-dashboard-gray.svg';
import IconLnbTestBlue from '@src/static/images/nav/icon-lnb-test-blue.svg';
import IconLnbTestGray from '@src/static/images/nav/icon-lnb-test-gray.svg';

// Pages
const UserDashboardPage = lazy(() => import('@src/pages/UserDashboardPage'));
const UserDockerImagePage = lazy(() =>
  import('@src/pages/UserDockerImagePage'),
);
const UserJobPage = lazy(() => import('@src/pages/UserJobPage'));
const UserDeploymentInfoPage = lazy(() =>
  import('@src/pages/UserDeploymentInfoPage'),
);
const UserTrainingInfoPage = lazy(() =>
  import('@src/pages/UserTrainingInfoPage'),
);
const DeployWorkerPage = lazy(() => import('@src/pages/DeployWorkerPage'));
const DeployWorkerDashboardPage = lazy(() =>
  import('@src/pages/DeployWorkerDashboardPage'),
);
const DeployDashboardPage = lazy(() =>
  import('@src/pages/DeployDashboardPage'),
);
const UserHomePage = lazy(() => import('@src/pages/UserHomePage'));
const UserDatasetPage = lazy(() => import('@src/pages/UserDatasetPage'));
const DatasetDetailPage = lazy(() => import('@src/pages/DatasetDetailPage'));
const UserTrainingPage = lazy(() => import('@src/pages/UserTrainingPage'));
const UserHpsPage = lazy(() => import('@src/pages/UserHpsPage'));
const UserCheckpointPage = lazy(() => import('@src/pages/UserCheckpointPage'));
const UserWorkbenchPage = lazy(() => import('@src/pages/UserWorkbenchPage'));
const UserFederatedLearningPage = lazy(() =>
  import('@src/pages/UserFederatedLearningPage'),
);
const UserDeploymentPage = lazy(() => import('@src/pages/UserDeploymentPage'));
const UserServicePage = lazy(() => import('@src/pages/UserServicePage'));
const UserTestPage = lazy(() => import('@src/pages/UserTestPage'));
const NotFoundPage = lazy(() => import('@src/pages/NotFoundPage'));

const IS_HIDE_TRAINING =
  import.meta.env.VITE_REACT_APP_IS_HIDE_TRAINING === 'true';
const IS_HIDE_JOB = import.meta.env.VITE_REACT_APP_IS_HIDE_JOB === 'true';
const IS_HIDE_HPS = import.meta.env.VITE_REACT_APP_IS_HIDE_HPS === 'true';
const IS_HIDE_DEPLOYMENT =
  import.meta.env.VITE_REACT_APP_IS_HIDE_DEPLOYMENT === 'true';
const IS_HIDE_TEST = import.meta.env.VITE_REACT_APP_IS_HIDE_TEST === 'true';
const IS_FL = import.meta.env.VITE_REACT_APP_IS_FEDERATED_LEARNING === 'true';

const trainingGroup = {
  backPath: '/user/workspace/:id/trainings',
  backPathBtnText: 'Training',
  target: 'TRAINING',
};

const workbenchGroup = {
  backPath: '/user/workspace/:id/trainings/:tid/workbench',
  backPathBtnText: 'Workbench',
  target: 'WORKBENCH',
};

const deployGroup = {
  backPath: '/user/workspace/:id/deployments',
  backPathBtnText: 'Deployment',
  target: 'DEPLOY',
};

const userRouteArr = [
  {
    name: 'Dashboard',
    path: '/user/dashboard',
    exact: true,
    disabled: true,
    render: (props) => <UserDashboardPage {...props} />,
  },
  {
    name: 'Home',
    path: '/user/workspace/:id/home',
    exact: true,
    icon: IconLnbHomeGray,
    activeIcon: IconLnbHomeBlue,
    render: (props) => <UserHomePage {...props} />,
  },
  {
    name: 'Docker Image',
    path: '/user/workspace/:id/docker_images',
    exact: true,
    icon: IconLnbDockerGray,
    activeIcon: IconLnbDockerBlue,
    render: (props) => <UserDockerImagePage {...props} />,
  },
  {
    name: 'Dataset',
    path: '/user/workspace/:id/datasets',
    exact: true,
    icon: IconLnbDatasetsGray,
    activeIcon: IconLnbDatasetsBlue,
    render: (props) => <UserDatasetPage {...props} />,
  },
  {
    name: 'Dataset Detail',
    path: '/user/workspace/:id/datasets/:did/files',
    exact: true,
    disabled: true,
    icon: IconLnbDatasetsGray,
    activeIcon: IconLnbDatasetsBlue,
    render: (props) => <DatasetDetailPage {...props} />,
  },
  {
    name: 'Training',
    path: '/user/workspace/:id/trainings',
    exact: true,
    isGroup: true,
    disabled: IS_HIDE_TRAINING,
    icon: IconLnbTrainingsGray,
    activeIcon: IconLnbTrainingsBlue,
    render: (props) => <UserTrainingPage {...props} />,
  },
  {
    name: 'Workbench',
    path: '/user/workspace/:id/trainings/:tid/workbench',
    exact: true,
    group: trainingGroup,
    isGroup: !IS_HIDE_JOB || !IS_HIDE_HPS,
    isFirstGroup: true,
    icon: IconLnbWorkbenchGray,
    activeIcon: IconLnbWorkbenchBlue,
    render: (props) => <UserWorkbenchPage {...props} />,
  },
  {
    name: 'JOB',
    path: '/user/workspace/:id/trainings/:tid/workbench/job',
    exact: true,
    disabled: IS_HIDE_JOB,
    group: trainingGroup,
    subGroup: workbenchGroup,
    render: (props) => <UserJobPage {...props} />,
  },
  {
    name: 'HPS',
    path: '/user/workspace/:id/trainings/:tid/workbench/hps',
    exact: true,
    disabled: IS_HIDE_HPS,
    group: trainingGroup,
    subGroup: workbenchGroup,
    render: (props) => <UserHpsPage {...props} />,
  },
  {
    name: 'FL',
    path: '/user/workspace/:id/trainings/:tid/federated-learning',
    exact: true,
    disabled: !IS_FL,
    group: trainingGroup,
    // isFirstGroup: true,
    icon: IconLnbFederatedLearningGray,
    activeIcon: IconLnbFederatedLearningBlue,
    render: (props) => <UserFederatedLearningPage {...props} />,
  },
  {
    name: 'Training Info',
    path: '/user/workspace/:id/trainings/:tid/info',
    exact: true,
    group: trainingGroup,
    isLastGroup: true,
    icon: IconLnbInformationGray,
    activeIcon: IconLnbInformationBlue,
    render: (props) => <UserTrainingInfoPage {...props} />,
  },
  {
    name: 'Checkpoint',
    path: '/user/workspace/:id/checkpoints',
    exact: true,
    disabled: true,
    icon: IconLnbTrainingsGray,
    activeIcon: IconLnbTrainingsBlue,
    render: (props) => <UserCheckpointPage {...props} />,
  },
  {
    name: 'Serving',
    path: '/user/workspace/:id/deployments',
    exact: true,
    isGroup: true,
    disabled: IS_HIDE_DEPLOYMENT,
    icon: IconLnbServingGray,
    activeIcon: IconLnbServingBlue,
    render: (props) => <UserDeploymentPage {...props} />,
  },
  {
    name: 'Dashboard',
    path: '/user/workspace/:id/deployments/:did/dashboard',
    group: deployGroup,
    isFirstGroup: true,
    icon: IconLnbDashboardGray,
    activeIcon: IconLnbDashboardBlue,
    render: (props) => <DeployDashboardPage {...props} />,
  },
  {
    name: 'Worker',
    path: '/user/workspace/:id/deployments/:did/workers',
    exact: true,
    group: deployGroup,
    icon: IconLnbWorkerGray,
    activeIcon: IconLnbWorkerBlue,
    render: (props) => <DeployWorkerPage {...props} />,
  },
  {
    name: 'Worker Detail',
    path: '/user/workspace/:id/deployments/:did/workers/:wkid/worker',
    exact: true,
    group: deployGroup,
    disabled: true,
    icon: IconLnbWorkerGray,
    activeIcon: IconLnbWorkerBlue,
    render: (props) => <DeployWorkerDashboardPage {...props} />,
  },
  {
    name: 'Deployment Info',
    path: '/user/workspace/:id/deployments/:did/info',
    exact: true,
    group: deployGroup,
    isLastGroup: true,
    icon: IconLnbInformationGray,
    activeIcon: IconLnbInformationBlue,
    render: (props) => <UserDeploymentInfoPage {...props} />,
  },
  {
    name: 'Test',
    path: '/user/workspace/:id/services',
    exact: true,
    disabled: IS_HIDE_TEST,
    icon: IconLnbTestGray,
    activeIcon: IconLnbTestBlue,
    render: (props) => <UserServicePage {...props} />,
  },
  {
    name: 'Test',
    path: '/user/workspace/:id/services/:sid/test',
    exact: true,
    disabled: true,
    icon: IconLnbTestGray,
    activeIcon: IconLnbTestBlue,
    render: (props) => <UserTestPage {...props} />,
  },
];

const RedirectRoute = ({ ...rest }) => (
  <Route
    {...rest}
    render={(props) => (
      <Redirect
        to={{ pathname: '/user/dashboard', state: { from: props.location } }}
      />
    )}
  />
);

const CommonRoute = ({ bgColor, children, ...rest }) => {
  return (
    <Route {...rest}>
      <PageTemplate navList={userRouteArr}>{children}</PageTemplate>
    </Route>
  );
};

function UserRouter({ trackingEvent }) {
  const { path } = useRouteMatch();
  const location = useLocation();
  const dispatch = useDispatch();

  // 이전 스크롤 위치 기억하기 위한 hook
  usePrevScroll();

  useEffect(() => {
    dispatch(closeAllModal());
  }, [dispatch, location]);

  return (
    <Switch>
      <RedirectRoute exact path={path} />
      {userRouteArr.map(({ path, exact, render }, key) => (
        <CommonRoute exact={exact} path={path} key={key}>
          {render({ trackingEvent })}
        </CommonRoute>
      ))}
      <NotFoundPage />
    </Switch>
  );
}

export default TrackingHOC(UserRouter);
