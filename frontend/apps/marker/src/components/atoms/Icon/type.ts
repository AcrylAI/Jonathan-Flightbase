export type IconSize = 'large' | 'normal' | 'small' | 'default';

export type CommonIconProps = {
  size?: IconSize;
  color?: string;
  fill?: string;
  onMouseover?: () => void;
};
