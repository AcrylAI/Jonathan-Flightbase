import { Story } from '@storybook/react';
import Button from '@src/components/atoms/button/Button';

import Table from './Table';
import { TableArgs, pageBtnAlign } from './types';
import { mockColumns, mockData } from './SampleData';

// import rightIcon from '@src/static/images/icons/00-ic-basic-arrow-02-right.svg';
// import leftIcon from '@src/static/images/icons/00-ic-basic-arrow-02-left.svg';

export default {
  title: 'UI KIT/Molecules/Table',
  component: Table,
  parameters: {
    componentSubtitle: 'Table',
  },
  argTypes: {
    pagingBtnAlign: {
      option: Object.values(pageBtnAlign).map((value) => value),
      control: { type: 'radio' },
    },
    PagingBtn: {
      control: { disable: true },
    },
  },
};

const TableTemplate = (args: TableArgs): JSX.Element => {
  const getCheckedIndex = (prev: Array<any>) => {
    return prev;
  };
  return <Table {...args} getCheckedIndex={getCheckedIndex} />;
};

export const BasicTable: Story<TableArgs> = TableTemplate.bind({});
BasicTable.args = {
  columns: mockColumns,
  data: mockData,
  bodyStyle: {
    visibleLine: true,
    visibleCellLine: false,
    scrollbarColor: 'light',
  },
  pageRowCnt: 10,
  isCheck: true,
  isPageNation: true,
  pagingBtnAlign: 'left',
  loading: false,
  PagingBtn: {
    MoveFirst: () => (
      <Button type='secondary' size='small'>
        first
      </Button>
    ),
    MoveLast: () => (
      <Button type='secondary' size='small'>
        last
      </Button>
    ),
    MovePrev: () => (
      <Button type='primary' size='medium'>
        prev
      </Button>
      // <img
      //   src={leftIcon}
      //   alt='prev'
      //   style={{
      //     width: '24px',
      //     height: '24px',
      //   }}
      // />
    ),
    MoveNext: () => (
      <Button type='primary' size='medium'>
        next
      </Button>
      // <img
      //   src={rightIcon}
      //   alt='prev'
      //   style={{
      //     width: '24px',
      //     height: '24px',
      //     lineHeight: '24px',
      //   }}
      // />
    ),
  },
};
