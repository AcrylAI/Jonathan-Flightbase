import { Story } from '@storybook/react';

import Header, { HeaderArgs } from './Header';

// Icons
import Logo from '@src/components/atoms/icon/LogoBi_01';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Molecules/Header',
  component: Header,
  argTypes: {
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
  },
};

const leftBoxContents = [
  <button>a</button>,
  <button>b</button>,
  <button>c</button>,
];
const rightBoxContents = [
  <button>a</button>,
  <button>b</button>,
  <button>c</button>,
];

const logoIcon = <Logo />;

const HeaderTemplate = (args: HeaderArgs): JSX.Element => <Header {...args} />;

export const DefaultHeader: Story<HeaderArgs> = HeaderTemplate.bind({});
DefaultHeader.args = {
  leftBoxContents,
  rightBoxContents,
  logoIcon,
  theme: theme.PRIMARY_THEME,
};
