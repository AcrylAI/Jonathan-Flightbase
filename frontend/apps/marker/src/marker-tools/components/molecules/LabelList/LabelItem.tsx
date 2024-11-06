import { Sypo } from '@src/components/atoms';

import styles from './LabelList.module.scss';
import classNames from 'classnames/bind';

import { CommonProps, EventProps, InputProps } from '@tools/types/components';

const cx = classNames.bind(styles);

type Props = CommonProps &
  Pick<EventProps, 'onClick'> &
  Pick<InputProps, 'selected'>;

function LabelItem({ className, children, style, selected, onClick }: Props) {
  return (
    <div
      className={cx('labelbox-container', { selected }, className)}
      style={style}
      onClick={onClick}
    >
      <Sypo type='p1' weight='r'>
        {children}
      </Sypo>
    </div>
  );
}

export type { Props as LabelItemPropType };

export default LabelItem;
