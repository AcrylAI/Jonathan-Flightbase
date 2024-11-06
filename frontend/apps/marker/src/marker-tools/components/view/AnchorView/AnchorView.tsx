import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './AnchorView.module.scss';
import classNames from 'classnames/bind';

import { CommonProps, FourCardinalPoints } from '@tools/types/components';
import { v4 as uuidv4 } from 'uuid';

const cx = classNames.bind(styles);

type Props = {
  contents: ReactNode;
  show?: boolean;
  margin?: number;
  point?: FourCardinalPoints;
} & CommonProps;

function AnchorView({
  contents,
  margin = 0,
  point = 's',
  show = false,
  children,
  className,
  style,
}: Props) {
  const [anchorUuid, setAnchorUuid] = useState<string>('');
  const [contentsUuid, setContentsUuid] = useState<string>('');
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [anchorTop, setAnchorTop] = useState(-1);
  const [anchorLeft, setAnchorLeft] = useState(-1);

  const setPosition = () => {
    if (anchorUuid.length > 0 && contentsUuid.length > 0) {
      const anchor = document.getElementById(anchorUuid);
      const content = document.getElementById(contentsUuid);

      if (
        anchor?.getBoundingClientRect() === null ||
        anchor?.getBoundingClientRect() === undefined ||
        content?.getBoundingClientRect() === null ||
        content?.getBoundingClientRect() === undefined
      ) {
        return;
      }

      const {
        top: _anchorTop,
        left: _anchorLeft,
        height: _anchorHeight,
        width: _anchorWidth,
      } = anchor.getBoundingClientRect();

      switch (point) {
        case 's':
          setAnchorTop(_anchorTop + _anchorHeight + margin);
          setAnchorLeft(_anchorLeft + _anchorWidth / 2);
          break;
        case 'n':
          setAnchorTop(_anchorTop - margin);
          setAnchorLeft(_anchorLeft + _anchorWidth / 2);
          break;
        case 'e':
          setAnchorTop(_anchorTop + _anchorHeight / 2);
          setAnchorLeft(_anchorLeft + _anchorWidth + margin);
          break;
        case 'w':
          setAnchorTop(_anchorTop + _anchorHeight / 2);
          setAnchorLeft(_anchorLeft - margin);
          break;
      }
    }
  };

  useEffect(() => {
    setRoot(document.body);
    setAnchorUuid(`anchorview_anchor_${uuidv4()}`);
    setContentsUuid(`anchorview_contents_${uuidv4()}`);
  }, []);

  useEffect(() => {
    if (show) setPosition();
  }, [show, anchorUuid, point]);

  useEffect(() => {
    window.addEventListener('resize', setPosition);

    return () => {
      window.removeEventListener('resize', setPosition);
    };
  }, [anchorUuid, point]);

  return (
    <div className={cx('anchorview-container', point, className)}>
      <div className={cx('anchorview-anchor')} id={anchorUuid}>
        {children}
      </div>

      {root !== null && show
        ? createPortal(
            <div
              className={cx('anchorview-contents', point)}
              style={{ ...style, left: anchorLeft, top: anchorTop }}
              id={contentsUuid}
            >
              {contents}
            </div>,
            root,
          )
        : null}
    </div>
  );
}

export type { Props as AnchorViewPropType };

export default AnchorView;
