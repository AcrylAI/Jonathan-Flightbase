import { Story } from '@storybook/react';
import { NavLink } from 'react-router-dom';

import SideNav, { SideNavArgs } from './SideNav';
import IconLnbHomeBlue from '@src/components/atoms/icon/IconLnbHomeBlue';
import IconLnbHomeGray from '@src/components/atoms/icon/IconLnbHomeGray';
import IconLnbHomeWhite from '@src/components/atoms/icon/IconLnbHomeWhite';
import IconLnbDockerBlue from '@src/components/atoms/icon/IconLnbDockerBlue';
import IconLnbDockerGray from '@src/components/atoms/icon/IconLnbDockerGray';
import IconLnbDockerWhite from '@src/components/atoms/icon/IconLnbDockerWhite';
import IconLnbDatasetsBlue from '@src/components/atoms/icon/IconLnbDatasetsBlue';
import IconLnbDatasetsGray from '@src/components/atoms/icon/IconLnbDatasetsGray';
import IconLnbDatasetsWhite from '@src/components/atoms/icon/IconLnbDatasetsWhite';
import IconLnbTrainingsBlue from '@src/components/atoms/icon/IconLnbTrainingsBlue';
import IconLnbTrainingsGray from '@src/components/atoms/icon/IconLnbTrainingsGray';
import IconLnbTrainingsWhite from '@src/components/atoms/icon/IconLnbTrainingsWhite';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Molecules/SideNav',
  component: SideNav,
  parameters: {
    componentSubtitle: 'SideNav',
  },
  argTypes: {
    responsive: {
      control: { type: 'boolean' },
    },
    theme: {
      options: Object.values(theme).map((value: string) => value),
      control: { type: 'radio' },
    },
    width: {
      control: { type: 'number' },
    },
  },
};

const navList = [
  {
    name: 'Home',
    path: '/user/workspace/:id',
    exact: true,
    icon: IconLnbHomeGray,
    activeIcon: IconLnbHomeBlue,
  },
  {
    name: 'Docker Image',
    path: '/user/workspace/:id/docker_images',
    exact: true,
    icon: IconLnbDockerGray,
    activeIcon: IconLnbDockerBlue,
  },
  {
    name: 'Dataset',
    path: '/user/workspace/:id/datasets',
    exact: true,
    icon: IconLnbDatasetsGray,
    activeIcon: IconLnbDatasetsBlue,
  },
  {
    name: 'Training',
    path: '/user/workspace/:id/trainings',
    exact: true,
    disabled: false,
    icon: IconLnbTrainingsGray,
    activeIcon: IconLnbTrainingsBlue,
  },
];

const darkNavList = [
  {
    name: 'Home',
    path: '/user/workspace/:id',
    exact: true,
    icon: IconLnbHomeGray,
    activeIcon: IconLnbHomeWhite,
  },
  {
    name: 'Docker Image',
    path: '/user/workspace/:id/docker_images',
    exact: true,
    icon: IconLnbDockerGray,
    activeIcon: IconLnbDockerWhite,
  },
  {
    name: 'Dataset',
    path: '/user/workspace/:id/datasets',
    exact: true,
    icon: IconLnbDatasetsGray,
    activeIcon: IconLnbDatasetsWhite,
  },
  {
    name: 'Training',
    path: '/user/workspace/:id/trainings',
    exact: true,
    disabled: false,
    icon: IconLnbTrainingsGray,
    activeIcon: IconLnbTrainingsWhite,
  },
];

const SideNavTemplate = (args: SideNavArgs): JSX.Element => (
  <SideNav
    {...args}
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
  />
);

export const DefaultSideNav: Story<SideNavArgs> = SideNavTemplate.bind({});
DefaultSideNav.args = {
  width: 184,
  navList,
};

export const JpSideNav: Story<SideNavArgs> = SideNavTemplate.bind({});
JpSideNav.args = {
  width: 184,
  theme: theme.PRIMARY_THEME,
  navList,
  mode: 'local',
  isManual: false,
};

export const JpDarkSideNav: Story<SideNavArgs> = SideNavTemplate.bind({});
JpDarkSideNav.args = {
  width: 184,
  theme: 'jp-dark',
  navList: darkNavList,
  mode: 'local',
  isManual: false,
};

export const FooterImg: Story<SideNavArgs> = SideNavTemplate.bind({});
FooterImg.args = {
  width: 184,
  theme: theme.PRIMARY_THEME,
  navList,
};
