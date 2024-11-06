import { theme } from '@src/utils';
import { Story } from '@storybook/react';
import { useState } from 'react';
import Screen1 from './Screen1';
import Screen2 from './Screen2';
import Tab from './Tab';
import { TabArgs } from './types';

export default {
  title: 'UI KIT/Atoms/Tab',
  component: Tab,
  parameters: {
    componentSubtitle: 'Tab 컴포넌트',
  },
  argTypes: {
    onClick: { action: '클릭' },
    theme: {
      options: Object.values(theme).map((theme) => theme),
      control: { type: 'radio' },
    },
  },
};

const TabTemplate = (args: TabArgs): JSX.Element => {
  const [selectedItem, setSelectedItem] = useState(0);
  const onClick = (idx: number, e?: React.MouseEvent<HTMLLIElement>) => {
    if (args.onClick) args.onClick(e);
    setSelectedItem(idx);
  };

  return (
    <Tab
      {...args}
      selectedItem={selectedItem}
      category={args.category}
      renderComponent={args.category && args.category[selectedItem].component}
      onClick={onClick}
    />
  );
};

export const PrimaryTab: Story<TabArgs> = TabTemplate.bind({});
PrimaryTab.args = {
  selectedItem: 0,
  theme: theme.PRIMARY_THEME,
  category: [
    {
      label: 'menu1',
      component: (props: { [key: string]: any }) => <Screen1 {...props} />,
    },
    {
      label: 'menu2',
      component: (props: { [key: string]: any }) => <Screen2 {...props} />,
    },
  ],
};
