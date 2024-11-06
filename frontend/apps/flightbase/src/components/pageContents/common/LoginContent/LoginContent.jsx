// Utils
import { today } from '@src/datetimeUtils';
import dayjs from 'dayjs';

// Components
import { Footer } from '@jonathan/ui-react';
import LoginFrame from '@src/components/Frame/LoginFrame';
import LoginHeader from './LoginHeader';
import LeftBoxContent from './LeftBoxContent';
import LoginForm from './LoginForm';
import Language from '@src/components/Frame/Footer/Language';

// Theme
import { theme } from '@src/utils';

// 커스텀 정의
import { PARTNER } from '@src/partner';

const MODE = import.meta.env.VITE_REACT_APP_MODE.toLowerCase();
const UPDATE_DATE = import.meta.env.VITE_REACT_APP_UPDATE_DATE || today();

// Copyright 연도
const year = dayjs().year();

function LoginContent() {
  return (
    <LoginFrame
      headerRender={<LoginHeader />}
      leftContentRender={<LeftBoxContent />}
      rightContentRender={<LoginForm />}
      footerRender={
        <Footer
          theme={theme.PRIMARY_THEME}
          logoIcon={PARTNER[MODE]?.logo.footer || PARTNER['jp'].logo.footer}
          copyrights={`© ${year} Acryl inc. All rights reserved.`}
          updated={UPDATE_DATE}
          language={<Language />}
        />
      }
    />
  );
}

export default LoginContent;
