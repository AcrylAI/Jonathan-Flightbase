import { Story } from '@storybook/react';

import PageTemplate, { PageTemplateArgs } from './PageTemplate';
import { PageTemplateContextProvider } from './context';

// Components
import SideNav from '@src/components/molecules/SideNav';
import Header from '@src/components/molecules/Header';
import Footer from '@src/components/molecules/Footer';

// Icons
// import JPIcon from '../../../static/images/logo/BI_Flightbase_v.svg';
import JPIcon2 from '@src/components/atoms/icon/LogoBi_02';
import HomeIcon from '@src/components/atoms/icon/IconLnbHomeGray';
import HomeIconHover from '@src/components/atoms/icon/IconLnbHomeBlue';
import DockerIcon from '@src/components/atoms/icon/IconLnbDockerGray';
import DockerIconHover from '@src/components/atoms/icon/IconLnbDockerBlue';
import DatasetIcon from '@src/components/atoms/icon/IconLnbDatasetsGray';
import DatasetIconHover from '@src/components/atoms/icon/IconLnbDatasetsBlue';
import TrainingIcon from '@src/components/atoms/icon/IconLnbTrainingsGray';
import TrainingIconHover from '@src/components/atoms/icon/IconLnbTrainingsBlue';
import DeploymentIcon from '@src/components/atoms/icon/IconLnbDeploymentsGray';
import DeploymentIconHover from '@src/components/atoms/icon/IconLnbDeploymentsBlue';
import { theme } from '@src/utils';
import { NavLink } from 'react-router-dom';

const styles = {
  transform: 'scale(1)',
  height: '100vh',
};

export default {
  title: 'UI KIT/Templates/PageTemplate',
  component: PageTemplate,
  // parameters: {
  //   componentSubtitle: 'PageTemplate',
  // },
  argTypes: {
    theme: {
      options: Object.values(theme).map((value: string) => value),
      control: { type: 'radio' },
    },
    // type: {
    //   options: Object.values(ButtonType).map((value: string): string => value),
    //   control: { type: 'select' },
    // },
    // size: {
    //   options: Object.values(ButtonSize).map((value: string): string => value),
    //   control: { type: 'radio' },
    // },
    // children: {
    //   control: { type: 'text' },
    // },
    // iconAlign: {
    //   options: Object.values(ButtonIconAlign).map(
    //     (value: string): string => value,
    //   ),
    //   control: { type: 'radio' },
    // },
    // onClick: { action: '클릭' },
  },
  decorators: [(storyFn: any) => <div style={styles}>{storyFn()}</div>],
};

const PageTemplate2 = (args: PageTemplateArgs): JSX.Element => (
  <PageTemplateContextProvider>
    <PageTemplate {...args} theme={args.theme} />
  </PageTemplateContextProvider>
);

const leftBoxContents = [<button>menu1</button>, <button>menu2</button>];
const rightBoxContents = [
  <button>menu3</button>,
  <button>menu4</button>,
  <button>menu5</button>,
];

export const PageTemplateSample: Story<PageTemplateArgs> = PageTemplate2.bind(
  {},
);

PageTemplateSample.args = {
  theme: theme.PRIMARY_THEME,
  headerRender: (hideMenuBtn, expandHandler) => (
    <Header
      theme={theme.PRIMARY_THEME}
      hideMenuBtn={hideMenuBtn}
      expandHandler={expandHandler}
      leftBoxContents={leftBoxContents}
      rightBoxContents={rightBoxContents}
    />
  ),
  sideNavRender: () => (
    <SideNav
      theme={theme.PRIMARY_THEME}
      onNavigate={({ element, path, activeClassName, isActive }) => {
        return (
          <NavLink
            to={path}
            activeClassName={activeClassName}
            isActive={isActive}
          >
            {element}
          </NavLink>
        );
      }}
      navList={[
        {
          name: 'Dashboard',
          path: '/user/dashboard',
          icon: HomeIcon,
          activeIcon: HomeIconHover,
        },
        {
          name: 'Docker Image',
          path: '/user/workspace',
          icon: DockerIcon,
          activeIcon: DockerIconHover,
        },
        {
          name: 'Dataset',
          path: '/user/dataset',
          icon: DatasetIcon,
          activeIcon: DatasetIconHover,
        },
        {
          name: 'Training',
          path: '/user/training',
          icon: TrainingIcon,
          activeIcon: TrainingIconHover,
        },
        {
          name: 'Deployment',
          path: '/user/deployment',
          icon: DeploymentIcon,
          activeIcon: DeploymentIconHover,
        },
      ]}
    />
  ),
  footerRender: () => (
    <Footer
      theme={theme.PRIMARY_THEME}
      logoIcon={JPIcon2}
      updated='2022.10.22'
    />
  ),
  children: new Array(50).fill(`컨텐츠 영역 `),
};
