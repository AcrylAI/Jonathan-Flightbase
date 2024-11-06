import { Properties as CSSProperties } from 'csstype';

export interface ButtonTypeTypes {
  readonly PRIMARY: string;
  readonly PRIMARY_REVERSE: string;
  readonly PRIMARY_LIGHT: string;
  readonly RED: string;
  readonly RED_REVERSE: string;
  readonly RED_LIGHT: string;
  readonly SECONDARY: string;
  readonly GRAY: string;
  readonly NONE_BORDER: string;
  readonly TEXT_UNDERLINE: string;
}

export interface ButtonSizeType {
  readonly LARGE: string;
  readonly MEDIUM: string;
  readonly SMALL: string;
  readonly X_SMALL: string;
}

export interface ButtonIconAlignType {
  readonly LEFT: string;
  readonly RIGHT: string;
}

export const ButtonType: ButtonTypeTypes = {
  PRIMARY: 'primary',
  PRIMARY_REVERSE: 'primary-reverse',
  PRIMARY_LIGHT: 'primary-light',
  RED: 'red',
  RED_REVERSE: 'red-reverse',
  RED_LIGHT: 'red-light',
  SECONDARY: 'secondary',
  GRAY: 'gray',
  NONE_BORDER: 'none-border',
  TEXT_UNDERLINE: 'text-underline',
};

export const ButtonSize: ButtonSizeType = {
  LARGE: 'large',
  MEDIUM: 'medium',
  SMALL: 'small',
  X_SMALL: 'x-small',
};

export const ButtonIconAlign: ButtonIconAlignType = {
  LEFT: 'left',
  RIGHT: 'right',
};

export interface ButtonArgs {
  type?: string;
  size?: string;
  children?: string;
  icon?: string;
  theme?: ThemeType;
  iconAlign?: string;
  iconStyle?: {
    [key: string]: string;
  };
  disabled?: boolean;
  customStyle?: CSSProperties;
  testId?: string;
  loading?: boolean;
  readonly onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseOver?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onMouseOut?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
