import { Properties as CSSProperties } from 'csstype';

export interface SwitchSizeType {
  readonly X_LARGE: string;
  readonly LARGE: string;
  readonly MEDIUM: string;
  readonly SMALL: string;
}

export const SwitchSize: SwitchSizeType = {
  X_LARGE: 'x-large',
  LARGE: 'large',
  MEDIUM: 'medium',
  SMALL: 'small',
};

export interface SwitchArgs {
  size?: string;
  disabled?: boolean;
  label?: string;
  customStyle?: CSSProperties;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labelAlign?: string;
}

export const initialLabelAlign = {
  LEFT: 'left',
  RIGHT: 'right',
};

export const SwitchInit: SwitchArgs = {
  disabled: false,
  label: 'label',
};
