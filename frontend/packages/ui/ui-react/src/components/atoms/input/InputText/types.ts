export interface InputStatusType {
  readonly DEFAULT: string;
  readonly ERROR: string;
}

export interface InputSizeType {
  readonly LARGE: string;
  readonly MEDIUM: string;
  readonly SMALL: string;
  readonly XSMALL: string;
}

export const InputStatus: InputStatusType = {
  DEFAULT: 'default',
  ERROR: 'error',
};

export const InputSize: InputSizeType = {
  LARGE: 'large',
  MEDIUM: 'medium',
  SMALL: 'small',
  XSMALL: 'x-small',
};

export interface InputTextArgs {
  status?: string;
  size?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  disableClearBtn?: boolean;
  disableLeftIcon?: boolean;
  disableRightIcon?: boolean;
  placeholder?: string;
  leftIcon?: string;
  rightIcon?: string;
  closeIcon?: string;
  customStyle: { [key: string]: string };
  options: { [key: string]: string };
  readonly onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onClear?: (e: HTMLInputElement) => void;
  theme?: ThemeType;
}
