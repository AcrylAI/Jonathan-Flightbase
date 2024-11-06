import {
  PageTemplate,
  PageTemplateProvider,
  Header,
  SideNav,
} from '@jonathan/ui-react';

// Components
import UserSetting from '@src/components/Frame/Header/UserSetting';
import LangSetting from '@src/components/Frame/Header/LangSetting';
import WorkspaceSetting from '@src/components/Frame/SideNav/WorkspaceSetting';

// Theme
import { theme } from '@src/utils';

const UI = () => {
  const leftBoxContents = [<WorkspaceSetting />];
  const rightBoxContents = [<UserSetting />, <LangSetting />];

  return (
    <PageTemplateProvider>
      <PageTemplate
        theme={theme.PRIMARY_THEME}
        headerRender={(isOpen, expandHandler) => (
          <Header
            theme={theme.PRIMARY_THEME}
            isOpen={isOpen}
            expandHandler={expandHandler}
            leftBoxContents={leftBoxContents}
            rightBoxContents={rightBoxContents}
          />
        )}
        sideNavRender={(isOpen) => (
          <SideNav
            theme={theme.PRIMARY_THEME}
            isOpen={isOpen}
            navList={[
              { name: 'Dashboard', path: '/user/dashboard' },
              { name: 'Dashboard', path: '/user/dashboard' },
              { name: 'Dashboard', path: '/user/dashboard' },
            ]}
          />
        )}
      >
        {new Array(1000).fill(`아아아<br />`)}
      </PageTemplate>
    </PageTemplateProvider>
  );
};

export default UI;
