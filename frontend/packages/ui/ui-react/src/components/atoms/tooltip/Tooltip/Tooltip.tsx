import { useState, useRef } from 'react';

import Balloon from './Balloon';
import {
  horizontalAlign,
  verticalAlign,
  iconAlign,
  tooltipType,
} from './types';
import { Properties as CSSProperties } from 'csstype';

// Icon
import alert from '@src/static/images/icons/00-ic-alert-info-o.svg';

// CSS Module
import classnames from 'classnames/bind';
import style from './Tooltip.module.scss';
const cx = classnames.bind(style);

type Props = {
  children?: React.ReactNode;
  customStyle?: CSSProperties;
  icon?: string;
  iconAlign?: 'left' | 'right';
  label?: string;
  title?: string;
  contents?: string;
  contentsAlign?: {
    vertical?: 'bottom' | 'top';
    horizontal?: 'left' | 'right' | 'center';
  };
  globalCustomStyle?: CSSProperties;
  iconCustomStyle?: CSSProperties;
  labelCustomStyle?: CSSProperties;
  contentsCustomStyle?: CSSProperties;
  type?: 'light' | 'dark';
  isTail?: boolean;
};

function Tooltip({
  children,
  customStyle,
  icon,
  iconAlign,
  label,
  title,
  contents,
  contentsAlign,
  globalCustomStyle,
  iconCustomStyle,
  labelCustomStyle,
  contentsCustomStyle,
  type,
  isTail,
}: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const tooltipHandler = (flag?: boolean) => {
    if (flag === true || flag === false) {
      setIsOpen(flag);
    } else {
      setIsOpen((isOpen: boolean) => !isOpen);
    }
  };

  return (
    <div
      className={cx('tooltip-wrap')}
      ref={tooltipRef}
      style={globalCustomStyle}
    >
      <div
        className={cx('tooltip-btn')}
        style={customStyle}
        onMouseOver={() => {
          tooltipHandler(true);
        }}
        onMouseLeave={() => {
          tooltipHandler(false);
        }}
        onTouchStart={() => {
          tooltipHandler(true);
        }}
        onTouchEnd={() => {
          tooltipHandler(false);
        }}
      >
        {!children ? (
          <>
            {iconAlign === 'left' && (
              <img src={icon} alt='icon' style={iconCustomStyle} />
            )}
            {label && (
              <label className={cx('label')} style={labelCustomStyle}>
                {label}
              </label>
            )}
            {iconAlign === 'right' && (
              <img src={icon} alt='icon' style={iconCustomStyle} />
            )}
          </>
        ) : (
          children
        )}
      </div>
      {isOpen && (
        <Balloon
          title={title}
          contents={contents}
          customStyle={contentsCustomStyle}
          contentsAlign={contentsAlign}
          type={type}
          isTail={isTail}
          tooltipHandler={tooltipHandler}
        />
      )}
    </div>
  );
}

Tooltip.defaultProps = {
  children: undefined,
  customStyle: undefined,
  icon: alert,
  iconAlign: iconAlign.LEFT,
  label: undefined,
  title: undefined,
  contents: undefined,
  contentsAlign: {
    vertical: verticalAlign.BOTTOM,
    horizontal: horizontalAlign.LEFT,
  },
  globalCustomStyle: undefined,
  iconCustomStyle: undefined,
  labelCustomStyle: undefined,
  contentsCustomStyle: undefined,
  type: tooltipType.LIGHT,
  isTail: false,
};

export default Tooltip;
