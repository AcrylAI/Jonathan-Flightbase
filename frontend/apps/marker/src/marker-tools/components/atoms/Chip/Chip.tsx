import { CSSProperties, ReactNode } from 'react';

import { Sypo } from '@src/components/atoms';

import styles from './Chip.module.scss';
import classNames from 'classnames/bind';

import {
  ColorPickSet,
  CommonProps,
  EventProps,
  InputProps,
} from '@tools/types/components';
import { colorContrast } from '@tools/utils';

const cx = classNames.bind(styles);

type Props = {
  icon?: ReactNode;
  color?: ColorPickSet;
} & CommonProps &
  Pick<EventProps, 'onClick'> &
  Pick<InputProps, 'selected'>;

function Chip({
  icon = undefined,
  color = '#fa4e57',
  selected = false,
  children,
  className,
  style,
  onClick,
}: Props) {
  const _style = (() => {
    const container: CSSProperties = { ...style };
    const icon: CSSProperties = {};

    if (selected) {
      container.color = colorContrast(color);
      icon.color = colorContrast(color);
      container.backgroundColor = color;
    } else {
      container.color = '#2A2D3E';
      container.backgroundColor = '#fff';
      icon.color = color;
    }

    container.borderColor = color;

    return { container, icon };
  })();

  return (
    <div
      className={cx('chip', { selected }, className)}
      style={_style.container}
      onClick={onClick}
    >
      {icon && (
        <div className={cx('chip-icon')} style={_style.icon}>
          {icon}
        </div>
      )}
      <Sypo type='p1' weight='regular'>
        {children}
      </Sypo>
    </div>
  );
}

export type { Props as ChipPropType };

export default Chip;
