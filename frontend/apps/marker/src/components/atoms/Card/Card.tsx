import React from 'react';

import style from './Card.module.scss';
// CSS Module
import classNames from 'classnames/bind';

import type { Properties as CSSProperties } from 'csstype';
const cx = classNames.bind(style);

type Props = {
  children: JSX.Element;
  hoverable?: boolean;
  customStyle?: CSSProperties;
  enterIcon?: string;
  onClickCard?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

function Card({
  children,
  hoverable,
  enterIcon,
  onClickCard,
  customStyle,
}: Props) {
  return (
    <div
      className={cx('card', hoverable && 'hoverable', onClickCard && 'pointer')}
      onClick={onClickCard}
      style={customStyle}
    >
      {enterIcon && (
        <img className={cx('enter-icon')} src={enterIcon} alt='enter' />
      )}
      {children}
    </div>
  );
}

Card.defaultProps = {
  customStyle: undefined,
  onClickCard: undefined,
  enterIcon: undefined,
  hoverable: false,
};

export default Card;
