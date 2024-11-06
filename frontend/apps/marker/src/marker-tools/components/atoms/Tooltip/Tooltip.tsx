import { ReactNode, useState } from 'react';

import { Sypo } from '@src/components/atoms';

import styles from './Tooltip.module.scss';
import classNames from 'classnames/bind';

import { AnchorView } from '@tools/components/view';
import {
  CommonProps,
  FourCardinalPoints,
  InputProps,
} from '@tools/types/components';

const cx = classNames.bind(styles);

type Props = {
  contents: ReactNode;
  point?: FourCardinalPoints;
} & Omit<CommonProps, 'onClick'> &
  Pick<InputProps, 'disabled'>;

function Tooltip({
  contents,
  point,
  children,
  style,
  className,
}: Props) {
  const [show, setShow] = useState(false);

  const onEnter = () => {
    setShow(true);
  };

  const onLeave = () => {
    setShow(false);
  };

  const _title = () => {
    if (typeof contents === 'string') {
      return (
        <Sypo type='p1' weight='r'>
          {contents}
        </Sypo>
      );
    }

    return contents;
  };

  const _contents = () => {
    return (
      <div className={cx('tooltip-container', point, className)} style={style}>
        {point === 's' && (
          <div className={cx('tooltip-pointer')}>
            <UpArrow />
          </div>
        )}
        {point === 'e' && (
          <div className={cx('tooltip-pointer')}>
            <RightArrow />
          </div>
        )}
        {_title()}
        {point === 'w' && (
          <div className={cx('tooltip-pointer')}>
            <LeftArrow />
          </div>
        )}
        {point === 'n' && (
          <div className={cx('tooltip-pointer')}>
            <DownArrow />
          </div>
        )}
      </div>
    );
  };

  return (
    <AnchorView contents={_contents()} point={point} margin={13} show={show}>
      <div
        className={cx('tooltip-eventbinder')}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {children}
      </div>
    </AnchorView>
  );
}

export type { Props as TooltipPropType };

export default Tooltip;

function RightArrow() {
  return (
    <svg
      width='13'
      height='14'
      viewBox='0 0 13 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M1.20803 8.75468C-0.178974 7.99603 -0.178974 6.00397 1.20803 5.24532L9.29026 0.824643C10.6231 0.0956489 12.25 1.06018 12.25 2.57932L12.25 11.4207C12.25 12.9398 10.6231 13.9044 9.29026 13.1754L1.20803 8.75468Z'
        fill='currentColor'
      />
    </svg>
  );
}

function LeftArrow() {
  return (
    <svg
      width='13'
      height='14'
      viewBox='0 0 13 15'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M12 5.76795C13.3333 6.53775 13.3333 8.46225 12 9.23205L3.75 13.9952C2.41667 14.765 0.75 13.8027 0.75 12.2631L0.75 2.73686C0.75 1.19726 2.41667 0.235009 3.75 1.00481L12 5.76795Z'
        fill='currentColor'
      />
    </svg>
  );
}

function UpArrow() {
  return (
    <svg
      width='14'
      height='13'
      viewBox='0 0 14 13'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M5.24532 1.20803C6.00397 -0.178974 7.99603 -0.178974 8.75468 1.20803L13.1754 9.29026C13.9044 10.6231 12.9398 12.25 11.4207 12.25L2.57932 12.25C1.06017 12.25 0.0956481 10.6231 0.824643 9.29026L5.24532 1.20803Z'
        fill='currentColor'
      />
    </svg>
  );
}

function DownArrow() {
  return (
    <svg
      width='14'
      height='13'
      viewBox='0 0 14 13'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M8.75468 11.792C7.99603 13.179 6.00396 13.179 5.24532 11.792L0.824641 3.70974C0.095647 2.37694 1.06017 0.750001 2.57932 0.750001L11.4207 0.750002C12.9398 0.750002 13.9044 2.37694 13.1754 3.70975L8.75468 11.792Z'
        fill='currentColor'
      />
    </svg>
  );
}
