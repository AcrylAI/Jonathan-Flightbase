import { Route } from 'react-router-dom';

import PageTemplate from '@src/components/templates/PageTemplate';

import { routerMap } from './routerMap';

const CommonRoute = ({ children, ...rest }) => {
  return (
    <Route {...rest}>
      <PageTemplate navList={routerMap}>{children}</PageTemplate>
    </Route>
  );
};

export default CommonRoute;
