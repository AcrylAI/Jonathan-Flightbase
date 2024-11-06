import { Switch, Route, BrowserRouter } from 'react-router-dom';

import ErrorBoundary from '@src/Error/ErrorBoundary';
import ClickAwayTestPage from '@src/pages/ClickAwayTestPage';
import IfComponentTestPage from '@src/pages/IfComponentTestPage';
import RootPage from '@src/pages/RootPage';

function App() {
  return (
    <ErrorBoundary fallback={<div>error</div>}>
      <BrowserRouter>
        <Switch>
          <Route exact path='/'>
            <RootPage />
          </Route>
          <Route exact path='/test/click-away'>
            <ClickAwayTestPage />
          </Route>
          <Route exact path='/test/if-component'>
            <IfComponentTestPage />
          </Route>
        </Switch>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
