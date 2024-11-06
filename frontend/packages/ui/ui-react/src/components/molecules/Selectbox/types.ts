import { Properties as CSSProperties } from 'csstype';

interface ObjectType {
  [key: string]: any;
}

export interface SelectboxStatusType {
  DEFAULT: string;
  ERROR: string;
}

export interface SelectboxType {
  PRIMARY: string;
  GROUP: string;
  SEARCH: string;
  MULTI: string;
  CHECKBOX: string;
}

export interface SelectboxSizeType {
  LARGE: string;
  MEDIUM: string;
  SMALL: string;
  XSMALL: string;
}

export const SelectboxStatus: SelectboxStatusType = {
  DEFAULT: 'default',
  ERROR: 'error',
};

export const SelectboxTypes: SelectboxType = {
  PRIMARY: 'primary',
  GROUP: 'group',
  SEARCH: 'search',
  MULTI: 'multi',
  CHECKBOX: 'checkbox',
};

export const SelectboxSize: SelectboxSizeType = {
  LARGE: 'large',
  MEDIUM: 'medium',
  SMALL: 'small',
  XSMALL: 'x-small',
};

export interface ListType extends ObjectType {
  label: string | Array<string>;
  value: string | number;
  isTitle?: boolean;
  isDisable?: boolean;
  icon?: string;
  iconStyle?: CSSProperties;
  iconAlign?: 'right' | 'left';
  checked?: boolean;
  StatusIcon?: React.FunctionComponent;
}

export interface selectedLabel {
  label: string;
}

export type onChangeEventType =
  | React.MouseEvent
  | React.MouseEvent<HTMLDivElement | HTMLInputElement | HTMLUListElement>
  | React.ChangeEvent<HTMLInputElement>
  | React.KeyboardEvent;

export interface FontStyle {
  font?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  fontSize?: string;
}

export interface SelectboxArgs {
  status: string;
  type: string;
  size: string;
  labelIcon: string;
  list: Array<ListType>;
  isSearch: boolean;
  selected: selectedLabel;
  selectedItem: ListType;
  selectedItemIdx: number;
  isReadOnly: boolean;
  isDisable: boolean;
  isShowStatusCheck: boolean;
  checkVisible: boolean;
  theme: ThemeType;
  options: Array<ListType>;
  visibleMulti?: boolean;
  multiboxTitle?: string;
  copiedOptions: Array<ListType>;
  fixedList?: boolean;
  setOptions: React.Dispatch<React.SetStateAction<Array<ListType>>>;
  setCopiedOptions: React.Dispatch<React.SetStateAction<Array<ListType>>>;
  placeholder: string;
  customStyle: {
    globalForm?: CSSProperties;
    selectboxForm?: CSSProperties;
    listForm?: CSSProperties;
    fontStyle?: {
      selectbox?: FontStyle;
      list?: FontStyle;
    };
    placeholderStyle?: CSSProperties;
    color?: string;
  };
  onChange?: (
    item: ListType | null,
    idx: number,
    e?: onChangeEventType,
  ) => void;
}
