import { Properties as CSSProperties } from 'csstype';

export interface IconAlignTypes {
  LEFT: 'left';
  RIGHT: 'right';
}

export interface HorizontalAlignType {
  LEFT: 'left';
  CENTER: 'center';
  RIGHT: 'right';
}

export interface VerticalAlignType {
  BOTTOM: 'bottom';
  TOP: 'top';
}

export interface TooltipType {
  LIGHT: 'light';
  DARK: 'dark';
}

export const horizontalAlign: HorizontalAlignType = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
};

export const verticalAlign: VerticalAlignType = {
  BOTTOM: 'bottom',
  TOP: 'top',
};

export const iconAlign: IconAlignTypes = {
  LEFT: 'left',
  RIGHT: 'right',
};

export const tooltipType: TooltipType = {
  LIGHT: 'light',
  DARK: 'dark',
};

export interface TooltipArgs {
  customStyle?: CSSProperties;
  icon?: string;
  iconAlign?: 'left' | 'right';
  iconCustomStyle?: CSSProperties;
  label?: string;
  labelCustomStyle?: CSSProperties;
  contents?: string;
  title?: string;
  verticalAlign?: 'bottom' | 'top';
  horizontalAlign?: 'left' | 'right' | 'center';
  contentsCustomStyle?: CSSProperties;
  type?: 'light' | 'dark';
}
