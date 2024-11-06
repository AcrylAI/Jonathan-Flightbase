import { Switch, useRouteMatch } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';

// ui-react
import { PageTemplateProvider } from '@jonathan/ui-react';

// Components
import CommonRoute from './CommonRoute';
import RedirectRoute from './RedirectRoute';
import ModalContainer from '@src/containers/ModalContainer';

import { routerMap } from './routerMap';
import ErrorBoundary from '@src/containers/ErrorBoundary';
import { ToastContainer } from '@src/components/uiContents/Toast';

const queryClient = new QueryClient();

const { VITE_REACT_APP_API_HOST, VITE_REACT_APP_REACT_QUERY_DEVTOOLS } =
  import.meta.env;
axios.defaults.baseURL = VITE_REACT_APP_API_HOST;

function PageRouter() {
  const { path } = useRouteMatch();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {VITE_REACT_APP_REACT_QUERY_DEVTOOLS === 'USE' && (
          <ReactQueryDevtools initialIsOpen={false} position={'top-right'} />
        )}
        <PageTemplateProvider>
          <ToastContainer
            position={toast.POSITION.BOTTOM_CENTER}
            autoClose={3000}
            progressStyle={{
              visibility: 'hidden',
            }}
          />
          <Switch>
            <RedirectRoute exact path={path} />
            {routerMap.map(({ exact, path, render }, key) => (
              <CommonRoute exact={exact} path={path} key={key}>
                {render()}
              </CommonRoute>
            ))}
          </Switch>
          <ModalContainer />
        </PageTemplateProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default PageRouter;
