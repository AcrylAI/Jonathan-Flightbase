import styles from './Tooltip.module.scss';
import classNames from 'classnames/bind';
import React, { useRef } from 'react';
import { Switch, Case, Default } from '@jonathan/react-utils';
import { DataInfoIcon } from '@src/static/images';
import { useState } from 'react';
import { Sypo } from '../Typography/Typo';
import { useEffect } from 'react';

const cx = classNames.bind(styles);

type IconProps = {
  handleHover: (
    e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLOrSVGElement>,
    type: 'enter' | 'leave',
  ) => void;
  status: 'ok' | 'error' | 'warning' | 'none';
};
const TooltipIcon = ({ handleHover, status }: IconProps) => {
  const statusHandler = () => {
    switch (status) {
      case 'ok':
        return '#00C775';
      case 'error':
        return '#FA4E57';
      case 'warning':
        return '#FFAB31';
      default:
        return '#93BAFF';
    }
  };
  return (
    <svg
      className={cx('img')}
      width='14'
      height='14'
      viewBox='0 0 14 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      onMouseEnter={(e) => handleHover(e, 'enter')}
      onMouseLeave={(e) => handleHover(e, 'leave')}
    >
      <path
        d='M7 0.5C5.71442 0.5 4.45772 0.881218 3.3888 1.59545C2.31988 2.30968 1.48676 3.32484 0.994786 4.51256C0.502816 5.70028 0.374095 7.00721 0.624899 8.26809C0.875703 9.52896 1.49477 10.6872 2.40381 11.5962C3.31285 12.5052 4.47104 13.1243 5.73192 13.3751C6.99279 13.6259 8.29973 13.4972 9.48744 13.0052C10.6752 12.5132 11.6903 11.6801 12.4046 10.6112C13.1188 9.54229 13.5 8.28558 13.5 7C13.4967 5.27711 12.8108 3.62573 11.5925 2.40746C10.3743 1.18918 8.72289 0.503304 7 0.5ZM6.875 3.5C7.02334 3.5 7.16834 3.54399 7.29168 3.6264C7.41502 3.70881 7.51115 3.82594 7.56791 3.96299C7.62468 4.10003 7.63953 4.25083 7.61059 4.39632C7.58165 4.5418 7.51022 4.67544 7.40533 4.78033C7.30044 4.88522 7.16681 4.95665 7.02132 4.98559C6.87583 5.01453 6.72503 4.99968 6.58799 4.94291C6.45095 4.88614 6.33381 4.79001 6.2514 4.66668C6.16899 4.54334 6.125 4.39834 6.125 4.25C6.125 4.05109 6.20402 3.86032 6.34467 3.71967C6.48532 3.57902 6.67609 3.5 6.875 3.5ZM7.5 10.5H7C6.86739 10.5 6.74022 10.4473 6.64645 10.3536C6.55268 10.2598 6.5 10.1326 6.5 10V7C6.36739 7 6.24022 6.94732 6.14645 6.85355C6.05268 6.75979 6 6.63261 6 6.5C6 6.36739 6.05268 6.24021 6.14645 6.14645C6.24022 6.05268 6.36739 6 6.5 6H7C7.13261 6 7.25979 6.05268 7.35356 6.14645C7.44732 6.24021 7.5 6.36739 7.5 6.5V9.5C7.63261 9.5 7.75979 9.55268 7.85356 9.64645C7.94732 9.74021 8 9.86739 8 10C8 10.1326 7.94732 10.2598 7.85356 10.3536C7.75979 10.4473 7.63261 10.5 7.5 10.5Z'
        fill={statusHandler()}
      />
    </svg>
  );
};
// auto detect
type Props = {
  children?: JSX.Element;
  icon?: string;
  desc?: string;
  type?: 'info' | 'data';
  // ok : green error : red none : blue
  status?: 'ok' | 'error' | 'warning' | 'none';
  // clock
  direction?: 'n' | 's' | 'w' | 'e' | 'ne' | 'nw' | 'se' | 'sw';
  offsetX?: number;
  offsetY?: number;
};

const Tooltip = ({
  icon,
  desc,
  children,
  direction,
  status,
  type,
  offsetX,
  offsetY,
}: Props) => {
  const [active, setActive] = useState<boolean>(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const handleHover = (
    e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLOrSVGElement>,
    type: 'enter' | 'leave',
  ) => {
    e.stopPropagation();
    if (type === 'enter') setActive(true);
    if (type === 'leave') setActive(false);
  };

  const posHandler = () => {
    if (active && iconRef.current && contentRef.current) {
      const bBox = iconRef.current.getBoundingClientRect();
      const cBox = contentRef.current.getBoundingClientRect();
      const osY = offsetY !== undefined ? offsetY : 0;
      const osX = offsetX !== undefined ? offsetX : 0;

      // 기본 오프셋
      const DEFAULT_OFFSET = 6;
      // 가로 방향
      const W_LEFT = bBox.left - (cBox.width + bBox.width / 2);
      const W_CENTER = bBox.left - (cBox.width / 2 - bBox.width / 2);
      const W_RIGHT = bBox.left + bBox.width + DEFAULT_OFFSET;

      // 세로 방향
      const H_TOP = bBox.top - cBox.height - DEFAULT_OFFSET;
      const H_CENTER = bBox.top - (cBox.height / 2 - bBox.height / 2);
      const H_BOTTOM = bBox.top + bBox.height + DEFAULT_OFFSET;

      let top = 0;
      let left = 0;
      switch (direction) {
        case 'n':
          top = H_TOP - osY;
          left = W_CENTER + osX;
          break;
        case 'ne':
          top = H_TOP - osY;
          left = W_RIGHT + osX;
          break;
        case 'e':
          top = H_CENTER - osY;
          left = W_RIGHT + osX;
          break;
        case 'se':
          top = H_BOTTOM - osY;
          left = W_RIGHT + osX;
          break;
        case 's':
          top = H_BOTTOM - osY;
          left = W_CENTER + osX;
          break;
        case 'sw':
          top = H_BOTTOM - osY;
          left = W_LEFT + osX;
          break;
        case 'w':
          top = H_CENTER - osY;
          left = W_LEFT + osX;
          break;
        case 'nw':
          top = H_TOP - osY;
          left = W_LEFT + osX;
          break;
        default:
          break;
      }
      contentRef.current.style.position = 'fixed';
      contentRef.current.style.top = `${top}px`;
      contentRef.current.style.left = `${left}px`;
    }
  };

  useEffect(() => {
    posHandler();
  }, [active]);
  return (
    <div className={cx('tooltip-container')}>
      <div className={cx('icon')} ref={iconRef}>
        <Switch>
          <Case condition={icon}>
            <img
              className={cx('img')}
              src={icon}
              alt='i'
              onMouseEnter={(e) => handleHover(e, 'enter')}
              onMouseLeave={(e) => handleHover(e, 'leave')}
            />
          </Case>
          <Default>
            <TooltipIcon handleHover={handleHover} status={status ?? 'none'} />
          </Default>
        </Switch>
      </div>
      <div className={cx('pos-wrapper', active && 'active')} ref={contentRef}>
        <Switch>
          <Case condition={children !== null}>{children}</Case>
          <Default>
            <div className={cx('desc-container')}>
              <Sypo type='P1'>{desc}</Sypo>
            </div>
          </Default>
        </Switch>
      </div>
    </div>
  );
};

Tooltip.defaultProps = {
  direction: 'n',
  children: null,
  offsetX: 0,
  offsetY: 0,
  icon: '',
  type: 'info',
  desc: '',
  status: 'none',
};

export default Tooltip;
