import { Suspense, lazy, useEffect } from 'react';
import { Route, useLocation, Redirect, Switch } from 'react-router-dom';

// Component
import TrackingHOC from '@src/hoc/TrackingHOC';
import { Loading } from '@jonathan/ui-react';
import DeferredComponent from '@src/hooks/useDeferredComponent';
import AdminFrame from '@src/components/Frame/AdminFrame';

// Actions
import { closeAllModal } from '@src/store/modules/modal';

const AdminDashboardPage = lazy(() => import('@src/pages/AdminDashboardPage'));
const AdminWorkspacePage = lazy(() => import('@src/pages/AdminWorkspacePage'));
const AdminTrainingPage = lazy(() => import('@src/pages/AdminTrainingPage'));
const AdminDeploymentPage = lazy(() =>
  import('@src/pages/AdminDeploymentPage'),
);
const AdminBuiltInModelPage = lazy(() =>
  import('@src/pages/AdminBuiltInModelPage'),
);
const AdminDockerImagePage = lazy(() =>
  import('@src/pages/AdminDockerImagePage'),
);
const AdminDatasetPage = lazy(() => import('@src/pages/AdminDatasetPage'));
const DatasetDetailPage = lazy(() => import('@src/pages/DatasetDetailPage'));
const AdminNodePage = lazy(() => import('@src/pages/AdminNodePage'));
const AdminStoragePage = lazy(() => import('@src/pages/AdminStoragePage'));
const AdminNetworkPage = lazy(() => import('@src/pages/AdminNetworkPage'));
const AdminBenchmarkingPage = lazy(() =>
  import('@src/pages/AdminBenchmarkingPage'),
);
const AdminRecordPage = lazy(() => import('@src/pages/AdminRecordPage'));
const AdminUserPage = lazy(() => import('@src/pages/AdminUserPage'));
const NotFoundPage = lazy(() => import('@src/pages/NotFoundPage'));

const path = '/admin';

function AdminRouter({ trackingEvent }) {
  const location = useLocation();

  const RedirectRoute = ({ ...rest }) => (
    <Route
      {...rest}
      render={(props) => (
        <Redirect
          to={{
            pathname: `${path}/dashboard`,
            state: { from: props.location },
          }}
        />
      )}
    />
  );

  useEffect(() => {
    closeAllModal();
  }, [location]);

  return (
    <AdminFrame type='ADMIN'>
      <Suspense
        fallback={
          <DeferredComponent>
            <Loading />
          </DeferredComponent>
        }
      >
        <Switch>
          <RedirectRoute exact path={path} />
          <Route
            path={`${path}/dashboard`}
            render={() => <AdminDashboardPage trackingEvent={trackingEvent} />}
          />
          <Route
            path={`${path}/workspaces`}
            render={() => <AdminWorkspacePage trackingEvent={trackingEvent} />}
          />
          <Route
            path={`${path}/trainings`}
            render={() => <AdminTrainingPage trackingEvent={trackingEvent} />}
          />
          <Route
            path={`${path}/deployments`}
            render={() => <AdminDeploymentPage trackingEvent={trackingEvent} />}
          />
          {/* <Route
            path={`${path}/builtin_models`}
            render={() => (
              <AdminBuiltInModelPage trackingEvent={trackingEvent} />
            )}
          /> */}
          <Route
            path={`${path}/docker_images`}
            render={() => (
              // <Loading></Loading>
              <AdminDockerImagePage trackingEvent={trackingEvent} />
            )}
          />
          <Route
            exact
            path={`${path}/datasets`}
            render={() => <AdminDatasetPage trackingEvent={trackingEvent} />}
          />
          <Route
            exact
            path={`${path}/datasets/:did/files`}
            render={() => <DatasetDetailPage trackingEvent={trackingEvent} />}
          />
          <Route
            path={`${path}/nodes`}
            render={() => <AdminNodePage trackingEvent={trackingEvent} />}
          />
          {/* <Route
            path={`${path}/storages`}
            render={() => <AdminStoragePage trackingEvent={trackingEvent} />}
          />
          <Route
            path={`${path}/networks`}
            render={() => <AdminNetworkPage trackingEvent={trackingEvent} />}
          />
          <Route
            path={`${path}/benchmarking`}
            render={() => (
              <AdminBenchmarkingPage trackingEvent={trackingEvent} />
            )}
          /> */}
          {/* <Route
            path={`${path}/records`}
            render={() => <AdminRecordPage trackingEvent={trackingEvent} />}
          /> */}
          <Route
            path={`${path}/users`}
            render={() => <AdminUserPage trackingEvent={trackingEvent} />}
          />
          <NotFoundPage />
        </Switch>
      </Suspense>
    </AdminFrame>
  );
}

export default TrackingHOC(AdminRouter);
