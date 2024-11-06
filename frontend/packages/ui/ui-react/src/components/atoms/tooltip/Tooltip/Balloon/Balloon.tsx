import { useRef, useEffect, useCallback } from 'react';

// Types
import { Properties as CSSProperties } from 'csstype';
import { horizontalAlign, verticalAlign, tooltipType } from '../types';

// CSS Module
import classnames from 'classnames/bind';
import style from './Balloon.module.scss';
const cx = classnames.bind(style);

type Props = {
  title?: string;
  contents?: string;
  type?: string;
  isTail?: boolean;
  customStyle?: CSSProperties;
  contentsAlign?: {
    vertical?: 'bottom' | 'top';
    horizontal?: 'left' | 'right' | 'center';
  };
  tooltipHandler: (flag?: boolean) => void;
};

function Balloon({
  title,
  contents,
  type,
  isTail,
  customStyle,
  contentsAlign,
  tooltipHandler,
}: Props) {
  const balloonRef = useRef<HTMLDivElement>(null);
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!balloonRef.current?.contains(e.target as Node)) {
        tooltipHandler();
      }
    },
    [tooltipHandler],
  );

  useEffect(() => {
    document.addEventListener('click', handleClick, false);
    return () => {
      document.removeEventListener('click', handleClick, false);
    };
  }, [handleClick]);

  return (
    <div
      className={cx(
        'balloon-wrap',
        type,
        contentsAlign?.vertical,
        contentsAlign?.horizontal,
        isTail ? 'tail' : 'pure',
      )}
      style={customStyle}
      ref={balloonRef}
    >
      {title && <p className={cx('title')}>{title}</p>}
      <div className={cx('contents')}>{contents}</div>
    </div>
  );
}

Balloon.defaultProps = {
  title: undefined,
  contents: undefined,
  type: tooltipType.LIGHT,
  isTail: false,
  customStyle: undefined,
  contentsAlign: {
    vertical: verticalAlign.BOTTOM,
    horizontal: horizontalAlign.LEFT,
  },
};

export default Balloon;
