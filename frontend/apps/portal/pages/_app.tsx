import { useState } from 'react';
import type { AppContext, AppProps } from 'next/app';

// next auth
import { getSession, SessionProvider } from 'next-auth/react';

// react query
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';

// recoil
import { RecoilRoot } from 'recoil';

// i18
import i18n from '@src/common/lang/i18n';
// import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';

// Components
import Loading from '@components/common/Loading/Loading';
import Modal from '@components/common/Modal';
import HeadMeta from '@components/common/SEO/HeadMeta';
import GlobalPopup, {
  GlobalPopupData,
} from '@components/common/Popup/GlobalPopup';

// axios
import axios from 'axios';

// shared
import { parseCookie } from '@src/shared/functions';

// Styles
import '@styles/globals.scss';
import classNames from 'classnames/bind';
import styles from './App.module.scss';
const cx = classNames.bind(styles);

const API_URL = process.env.NEXT_PUBLIC_ENV_API_HOST;
axios.defaults.baseURL = API_URL;

// main popup
const popupData = GlobalPopupData;

function MyApp({
  Component,
  pageProps: { session, language, ...pageProps },
}: AppProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { suspense: true } } }),
  );

  i18n.changeLanguage(language);

  return (
    <SessionProvider session={session}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <Hydrate state={pageProps.dehydratedState}>
            <RecoilRoot>
              <HeadMeta />
              <GlobalPopup {...popupData} />
              <Loading />
              <div className={cx('body-wrap')}>
                <div className={cx('body-container')} id='scrollTop'>
                  <Component {...pageProps} />
                  <Modal />
                </div>
              </div>
            </RecoilRoot>
          </Hydrate>
        </QueryClientProvider>
      </I18nextProvider>
    </SessionProvider>
  );
}

MyApp.getInitialProps = async ({ Component, ctx }: AppContext) => {
  const session = await getSession(ctx);

  let pageProps = {};
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  let language = 'ko';

  // 브라우저의 국가 셋팅을 불러온다.
  const acceptLanguage = ctx.req?.headers['accept-language'];
  const locations = acceptLanguage?.split(';');

  // 후에 지원 국가를 추가하려면, 파싱 함수를 제작하여 처리
  if (locations && locations.length > 0) {
    language = locations[0].includes('en') ? 'en' : 'ko';
  }

  const cookies = parseCookie(ctx.req?.headers?.cookie ?? '');
  if (cookies.language) {
    language = cookies.language;
  }

  return { pageProps: { ...pageProps, session, language } };
};

export default MyApp;
