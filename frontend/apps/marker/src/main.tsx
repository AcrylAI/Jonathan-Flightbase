// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
// import { worker } from '@src/mocks/Worker';
import { RecoilRoot } from 'recoil';
import { RecoilDevTools } from 'recoil-gear';

import '@src/common/lang/i18n';
import '@jonathan/ui-react/build/index.css';

// import { ReactQueryDevtools } from 'react-query/devtools';
import App from './App';

import './styles/style.scss';
import './index.scss';

export const queryClient = new QueryClient();
// react-query 기본 설정
// 1. disable caching
// 2. disable stale
// 3. disable refetchOnWindowFocus
// 4. disable fetch retry
queryClient.setDefaultOptions({
  queries: {
    cacheTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 0,
  },
  mutations: {
    retry: 0,
  },
});

const root = createRoot(document.getElementById('root') as Element);
root.render(
  <QueryClientProvider client={queryClient}>
    <RecoilRoot>
      <RecoilDevTools />
      <App />
    </RecoilRoot>
  </QueryClientProvider>,
);

// ReactDOM.render(
//   <QueryClientProvider client={queryClient}>
//     <RecoilRoot>
//       <RecoilDevTools />
//       <App />
//     </RecoilRoot>
//   </QueryClientProvider>,
//   document.getElementById('root'),
// );
