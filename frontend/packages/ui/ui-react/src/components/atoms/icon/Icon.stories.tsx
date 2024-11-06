import { Story } from '@storybook/react';

import Icon from './Icon';
import { IconArgs, IconCompoList, IconComponentType } from './IconTypes';

import IconLnbDatasetsBlue from './IconLnbDatasetsBlue';
import IconLnbDatasetsWhite from './IconLnbDatasetsWhite';
import IconLnbDeploymentsBlue from './IconLnbDeploymentsBlue';
import IconLnbDeploymentsWhite from './IconLnbDeploymentsWhite';
import IconLnbDockerBlue from './IconLnbDockerBlue';
import IconLnbDockerWhite from './IconLnbDockerWhite';
import IconLnbHomeBlue from './IconLnbHomeBlue';
import IconLnbHomeWhite from './IconLnbHomeWhite';
import IconLnbServicesBlue from './IconLnbServicesBlue';
import IconLnbServicesWhite from './IconLnbServicesWhite';
import IconLnbTrainingsBlue from './IconLnbTrainingsBlue';
import IconLnbTrainingsWhite from './IconLnbTrainingsWhite';

import classNames from 'classnames/bind';
import style from './Icon.module.scss';
const cx = classNames.bind(style);

export default {
  title: 'UI KIT/Atoms/icon',
  component: Icon,
  parameters: {
    componentSubtitle: '아이콘 컴포넌트',
  },
  argTypes: {
    viewAllIcons: {
      control: { disable: true },
    },
    IconCompoList: {
      control: { disable: true },
    },
    name: {
      control: { disable: true },
    },
  },
};

const IconsTemplate = (args: IconArgs): JSX.Element => {
  return (
    <>
      {args.viewAllIcons && args.IconCompoList && (
        <ul className={cx('icon-compo-list')}>
          {IconCompoList.map((IconComp: IconComponentType, idx: number) => {
            return (
              <li key={idx}>
                <Icon
                  IconComponent={IconComp.Component}
                  IconComponentProps={IconComp.props}
                  name={IconComp.name}
                />
              </li>
            );
          })}
        </ul>
      )}
      {!args.viewAllIcons && <Icon {...args} />}
    </>
  );
};

export const AllIcons: Story<IconArgs> = IconsTemplate.bind({});
AllIcons.args = {
  IconCompoList,
  viewAllIcons: true,
};

export const IconLnbDatasetsBlueCompo: Story<IconArgs> = IconsTemplate.bind({});
IconLnbDatasetsBlueCompo.args = {
  viewAllIcons: false,
  IconComponent: IconLnbDatasetsBlue,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbDatasetsBlue',
};

export const IconLnbDatasetsWhiteCompo: Story<IconArgs> = IconsTemplate.bind(
  {},
);
IconLnbDatasetsWhiteCompo.args = {
  viewAllIcons: false,
  IconComponent: IconLnbDatasetsWhite,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbDatasetsWhite',
};

export const IconLnbDeploymentsBlueCompo: Story<IconArgs> = IconsTemplate.bind(
  {},
);
IconLnbDeploymentsBlueCompo.args = {
  viewAllIcons: false,
  IconComponent: IconLnbDeploymentsBlue,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbDeploymentsBlue',
};

export const IconLnbDeploymentsWhiteCompo: Story<IconArgs> = IconsTemplate.bind(
  {},
);
IconLnbDeploymentsWhiteCompo.args = {
  viewAllIcons: false,
  IconComponent: IconLnbDeploymentsWhite,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbDeploymentsWhite',
};

export const IconLnbDockerBlueCompo: Story<IconArgs> = IconsTemplate.bind({});
IconLnbDockerBlueCompo.args = {
  viewAllIcons: false,
  IconComponent: IconLnbDockerBlue,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbDockerBlue',
};

export const IconLnbDockerWhiteCompo: Story<IconArgs> = IconsTemplate.bind({});
IconLnbDockerWhiteCompo.args = {
  viewAllIcons: false,
  IconComponent: IconLnbDockerWhite,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbDockerWhite',
};

export const IconLnbHomeBlueCompo: Story<IconArgs> = IconsTemplate.bind({});
IconLnbHomeBlueCompo.args = {
  viewAllIcons: false,
  IconComponent: IconLnbHomeBlue,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbHomeBlue',
};

export const IconLnbHomeWhiteIcon: Story<IconArgs> = IconsTemplate.bind({});
IconLnbHomeWhiteIcon.args = {
  viewAllIcons: false,
  IconComponent: IconLnbHomeWhite,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbHomeWhite',
};

export const IconLnbServicesBlueCompo: Story<IconArgs> = IconsTemplate.bind({});
IconLnbServicesBlueCompo.args = {
  viewAllIcons: false,
  IconComponent: IconLnbServicesBlue,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbServicesBlue',
};

export const IconLnbServicesWhiteCompo: Story<IconArgs> = IconsTemplate.bind(
  {},
);
IconLnbServicesWhiteCompo.args = {
  viewAllIcons: false,
  IconComponent: IconLnbServicesWhite,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbServicesWhite',
};

export const IconLnbTrainingsBlueCompo: Story<IconArgs> = IconsTemplate.bind(
  {},
);
IconLnbTrainingsBlueCompo.args = {
  viewAllIcons: false,
  IconComponent: IconLnbTrainingsBlue,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbTrainingsBlue',
};

export const IconLnbTrainingsWhiteCompo: Story<IconArgs> = IconsTemplate.bind(
  {},
);
IconLnbTrainingsWhiteCompo.args = {
  viewAllIcons: false,
  IconComponent: IconLnbTrainingsWhite,
  IconComponentProps: {
    width: 32,
    height: 32,
  },
  name: 'IconLnbTrainingsWhite',
};
