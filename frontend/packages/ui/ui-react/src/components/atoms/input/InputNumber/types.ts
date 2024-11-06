interface InputNumberStatusType {
  DEFAULT: string;
  ERROR: string;
}

interface InputNumberSizeType {
  LARGE: string;
  MEDIUM: string;
  SMALL: string;
  XSMALL: string;
}

interface InputNumberIconTypes {
  UP_ICON: string;
  DOWN_ICON: string;
}

interface InputNumberDataType {
  name?: string;
  value: number | string;
  min?: number;
  max?: number;
  target?: {
    value: string;
    name?: string;
    min?: number;
    max?: number;
  };
}

interface InputNumberIconSizeType {
  width?: string;
  height?: string;
}

const InputNumberStatus: InputNumberStatusType = {
  DEFAULT: 'default',
  ERROR: 'error',
};

const InputNumberSize: InputNumberSizeType = {
  LARGE: 'large',
  MEDIUM: 'medium',
  SMALL: 'small',
  XSMALL: 'x-small',
};

interface InputNumberArgs {
  status?: string;
  size?: string;
  max?: number;
  min?: number;
  step?: number;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  placeholder?: string;
  upIcon?: string;
  downIcon?: string;
  customSize?: InputNumberIconSizeType;
  name?: string;
  theme?: ThemeType;
  onChange?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  valueAlign?: string;
}

export {
  InputNumberStatusType,
  InputNumberSizeType,
  InputNumberIconTypes,
  InputNumberIconSizeType,
  InputNumberDataType,
  InputNumberStatus,
  InputNumberSize,
  InputNumberArgs,
};
