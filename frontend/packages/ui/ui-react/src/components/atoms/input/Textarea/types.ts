import { Properties as CSSProperties } from 'csstype';

export interface TextareaStatusType {
  DEFAULT: string;
  ERROR: string;
}

export interface TextareaSizeType {
  LARGE: string;
  MEDIUM: string;
  SMALL: string;
  XSMALL: string;
}

export const TextareaStatus: TextareaStatusType = {
  DEFAULT: 'default',
  ERROR: 'error',
};

export const TextareaSize: TextareaSizeType = {
  LARGE: 'large',
  MEDIUM: 'medium',
  SMALL: 'small',
  XSMALL: 'x-small',
};

export interface TextareaArgs {
  status?: string;
  size?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  placeholder?: string;
  customStyle?: CSSProperties;
  theme?: ThemeType;
  readonly onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
