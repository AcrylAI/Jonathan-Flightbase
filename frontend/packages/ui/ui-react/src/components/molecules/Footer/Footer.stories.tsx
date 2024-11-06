import { Story } from '@storybook/react';
import dayjs from 'dayjs';

import Footer, { FooterArgs } from './Footer';
import { nowLocalTime } from '@src/utils/datetimeUtils';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Molecules/Footer',
  component: Footer,
  argTypes: {
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
  },
};

const copyrights = `© ${dayjs().year()} Acryl inc. All rights reserved.`;
const updated = nowLocalTime('YYYY.MM.DD');

const FooterTemplate = (args: FooterArgs): JSX.Element => <Footer {...args} />;

export const DefaultFooter: Story<FooterArgs> = FooterTemplate.bind({});
DefaultFooter.args = {
  copyrights,
  updated,
  theme: theme.PRIMARY_THEME,
};
