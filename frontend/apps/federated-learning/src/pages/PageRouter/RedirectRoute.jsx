import { Redirect, Route } from 'react-router-dom';

const RedirectRoute = ({ ...rest }) => (
  <Route
    {...rest}
    render={(props) => (
      <Redirect
        to={{ pathname: '/dashboard', state: { from: props.location } }}
      />
    )}
  />
);

export default RedirectRoute;
