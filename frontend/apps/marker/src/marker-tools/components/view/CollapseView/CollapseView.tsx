import { useEffect, useState } from 'react';

import styles from './CollapseView.module.scss';
import classNames from 'classnames/bind';

import { CommonProps } from '@tools/types/components';
import { v4 as uuidv4 } from 'uuid';

const cx = classNames.bind(styles);

type Props = {
  open?: boolean;
  collapsible?: 'width' | 'height';
  duration?: number;
  minimum?: number;
} & Omit<CommonProps, 'style'>;

function CollapseView({
  open = false,
  collapsible = 'height',
  duration = 150,
  minimum = 0,
  children,
  className,
}: Props) {
  const [uuid, setUuid] = useState('');
  const [height, setHeight] = useState<number | string | undefined>(undefined);
  const [width, setWidth] = useState<number | string | undefined>(undefined);
  const [flag, setFlag] = useState<boolean>(false);

  const extendView = () => {
    if (uuid.length === 0) return;

    const contents = document.getElementById(uuid);
    if (
      contents?.getBoundingClientRect() === null ||
      contents?.getBoundingClientRect() === undefined
    ) {
      return;
    }

    const { height: h, width: w } = contents.getBoundingClientRect();
    const _height = Math.round(h);
    const _width = Math.round(w);

    if (collapsible === 'height') {
      if (!open) {
        setHeight(_height);
        setTimeout(() => {
          setHeight(minimum);
        }, 30);
      } else {
        setHeight(_height);
        setTimeout(
          () => {
            if (_height !== minimum) {
              setHeight('auto');
            }
          },
          duration,
          _height,
        );
      }
    } else {
      // collapsible === 'width'
      if (!open) {
        setWidth(_width);
        setTimeout(() => {
          setWidth(minimum);
        }, 30);
      } else {
        setWidth(_width);
        setTimeout(
          () => {
            if (_width !== minimum) {
              setWidth('auto');
            }
          },
          duration,
          _width,
        );
      }
    }
  };

  useEffect(() => {
    setUuid(`collapsibleview_${uuidv4()}`);
  }, []);

  useEffect(() => {
    if (collapsible === 'width') {
      setHeight(undefined);
      setWidth(minimum);
    } else {
      // collapsible === 'height'
      setWidth(undefined);
      setHeight(minimum);
    }
  }, [collapsible, minimum]);

  useEffect(() => {
    if (!flag && open) {
      setFlag(true);
    }
  }, [flag, open]);

  useEffect(() => {
    if (flag && uuid.length > 0) {
      extendView();
    }
  }, [open, flag, uuid, collapsible, duration]);

  return (
    <div
      className={cx('collapseview-container', { open }, collapsible, className)}
      style={{ width, height }}
    >
      <div className={cx('collapseview-contents')} id={uuid}>
        {children}
      </div>
    </div>
  );
}

export type { Props as CollapseViewPropType };

export default CollapseView;
