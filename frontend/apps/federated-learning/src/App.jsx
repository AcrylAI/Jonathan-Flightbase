import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Router } from 'react-router-dom';

// custom hook
import useTheme from './hooks/useTheme';

// module
import { activeTab, inActiveTab } from '@src/store/modules/tab';

// Router
import PageRouter from './pages/PageRouter';

import customHistory from '@src/customHistory';

// Style
import './App.css';

const MODE = import.meta.env.VITE_REACT_APP_MODE;
const UPDATED_DATE = import.meta.env.VITE_REACT_APP_UPDATE_DATE || 'Unknown';
const API_HOST = import.meta.env.VITE_REACT_APP_API_HOST;

// 콘솔로그 Welcome message
const emoji = ['😊', '🥰', '😄', '😆', '🤩', '😘'];
function randomEmoji() {
  let random = Math.floor(Math.random() * emoji.length);
  return emoji[random];
}
console.log(
  `%cWelcome to Federated Learning!${randomEmoji()} %c\n${
    MODE === 'local' || MODE === 'dev'
      ? `API: ${API_HOST}`
      : `FLIGHTBASE © ${
          UPDATED_DATE.split('.')[0]
        } Acryl inc. All rights reserved.`
  }  Updated: %c${UPDATED_DATE}\n`,
  `color: #fff; font-family: SpoqaB; font-size: 32px;
  text-shadow: 2px 2px #35323e; text-align: center;
  border: 4px solid #25232a; border-radius: 8px;
  background: linear-gradient(45deg, #35323e, 40%, #c2c2c2);
  padding: 16px 32px; margin: 16px 0px`,
  `color: #35323e; font-family: SpoqaR; font-size: 11px;`,
  `color: #000000; font-family: SpoqaM; font-size: 11px;`,
);

function App() {
  const dispatch = useDispatch();
  // const { auth, prompt } = useSelector(({ auth, prompt }) => ({
  //   auth,
  //   prompt,
  // }));
  // const { isAuth, type } = auth;

  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        dispatch(activeTab());
      } else {
        dispatch(inActiveTab());
      }
    });
  }, [dispatch]);

  useTheme();

  return (
    <Router history={customHistory} basename='/'>
      <PageRouter />
    </Router>
  );
}

export default App;
