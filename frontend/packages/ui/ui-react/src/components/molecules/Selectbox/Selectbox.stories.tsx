import { useState } from 'react';
import { Story } from '@storybook/react';

import Selectbox from './Selectbox';

import {
  ListType,
  SelectboxArgs,
  SelectboxSize,
  SelectboxStatus,
  SelectboxTypes,
  onChangeEventType,
} from './types';
import { InitPrimaryList, InitGroupList } from './MockingData';

import labelIcon from '@src/static/images/icons/ic-down.svg';

import { useTranslation } from 'react-i18next';
import { theme } from '@src/utils';

export default {
  title: 'UI KIT/Molecules/Selectbox',
  component: Selectbox,
  parameters: {
    componentSubtitle: 'Selectbox 컴포넌트',
  },
  argTypes: {
    status: {
      options: Object.values(SelectboxStatus).map((value: string) => value),
      control: { type: 'select' },
    },
    type: {
      options: Object.values(SelectboxTypes).map((value: string) => value),
      control: { disable: true },
      // control: { type: 'select' },
    },
    theme: {
      options: Object.values(theme).map((value: string) => value),
      control: { type: 'radio' },
    },
    size: {
      options: Object.values(SelectboxSize).map((value: string) => value),
      control: { type: 'radio' },
    },
    isReadOnly: {
      control: { type: 'boolean' },
    },
    selectedItemIdx: {
      control: { disable: true },
    },
    onClick: { action: '클릭' },
    onChange: { action: '선택' },
  },
};

const SelectboxTemplate = (args: SelectboxArgs): JSX.Element => {
  const [selectedItemIdx, setSelectedItemIdx] = useState(args.selectedItemIdx);
  const [selectedItem, setSelectedItem] = useState(args.selectedItem);
  const { t } = useTranslation();

  const onChange = (item: ListType, idx: number, e?: onChangeEventType) => {
    if (args.onChange && e) {
      if (e) {
        args.onChange(selectedItem, idx, e);
      } else {
        args.onChange(selectedItem, idx);
      }
    }
    setSelectedItem(item);
    setSelectedItemIdx(idx);
  };

  return (
    <Selectbox
      {...args}
      selectedItemIdx={selectedItemIdx}
      onChange={onChange}
      t={t}
      scrollAutoFocus
    />
  );
};

export const PrimarySelecbox: Story<SelectboxArgs> = SelectboxTemplate.bind({});
PrimarySelecbox.args = {
  status: SelectboxStatus.DEFAULT,
  type: SelectboxTypes.PRIMARY,
  size: SelectboxSize.MEDIUM,
  isReadOnly: false,
  isDisable: false,
  theme: theme.PRIMARY_THEME,
  list: InitPrimaryList,
  selectedItemIdx: 0,
  labelIcon,
  placeholder: 'placeholder',
  fixedList: true,
  customStyle: {
    globalForm: {},
    selectboxForm: {},
    listForm: {},
    fontStyle: {},
    placeholderStyle: {},
  },
};

export const GroupSelectbox: Story<any> = SelectboxTemplate.bind({});
GroupSelectbox.args = {
  status: SelectboxStatus.DEFAULT,
  type: SelectboxTypes.GROUP,
  size: SelectboxSize.MEDIUM,
  isReadOnly: false,
  isDisable: false,
  list: InitGroupList,
  selectedItemIdx: 1,
  labelIcon,
  fixedList: true,
  customStyle: {
    globalForm: {},
    selectboxForm: {},
    listForm: {},
  },
};

export const SearchSelectbox: Story<SelectboxArgs> = SelectboxTemplate.bind({});
SearchSelectbox.args = {
  type: SelectboxTypes.SEARCH,
  status: SelectboxStatus.DEFAULT,
  size: SelectboxSize.MEDIUM,
  selectedItemIdx: 0,
  isReadOnly: false,
  isDisable: false,
  list: InitPrimaryList,
  placeholder: 'placeholder',
  fixedList: true,
  labelIcon,
  customStyle: {
    globalForm: {},
    selectboxForm: {},
    listForm: {},
    fontStyle: {},
  },
};

export const checkboxSelectbox: Story<SelectboxArgs> = SelectboxTemplate.bind(
  {},
);
checkboxSelectbox.args = {
  type: SelectboxTypes.CHECKBOX,
  status: SelectboxStatus.DEFAULT,
  size: SelectboxSize.MEDIUM,
  selectedItemIdx: 0,
  isReadOnly: false,
  isDisable: false,
  list: InitPrimaryList,
  placeholder: 'placeholder',
  labelIcon,
  customStyle: {
    globalForm: {},
    selectboxForm: {},
    listForm: {},
    fontStyle: {},
  },
};

// export const MultiSelectbox: Story<SelectboxArgs> = SelectboxTemplate.bind({});
// MultiSelectbox.args = {
//   type: SelectboxTypes.MULTI,
//   status: SelectboxStatus.DEFAULT,
//   size: SelectboxSize.MEDIUM,
//   selectedItemIdx: 0,
//   isReadOnly: false,
//   isDisable: false,
//   isSearch: true,
//   selected: { label: 'all.label' },
//   options: [
//     { label: '포카리', checked: true, value: '코파리', isDisabled: false },
//   ],
//   placeholder: 'placeholder',
//   customStyle: {
//     globalForm: {},
//     selectboxForm: {},
//     listForm: {},
//     fontStyle: {},
//   },
// };
