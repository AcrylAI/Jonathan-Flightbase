import styles from './AutoLabelingListItemContainer.module.scss';
import classNames from 'classnames/bind';
import React, { CSSProperties } from 'react';

const cx = classNames.bind(styles);

type Props = {
  selected?: boolean;
  disabled?: boolean;
  create?: boolean;
  isLoading?: boolean;
  leftSide?: JSX.Element;
  rightSide?: JSX.Element;
  children?: JSX.Element;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  customStyle?: CSSProperties;
};
const AutoLabelingListItemContainer = ({
  disabled,
  selected,
  leftSide,
  isLoading,
  create,
  rightSide,
  customStyle,
  children,
  onClick,
}: Props) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading && onClick) {
      onClick(e);
    }
  };
  return (
    <div
      className={cx(
        'item-container',
        create && 'create',
        selected && 'selected',
        disabled && 'disabled',
        isLoading && 'isLoading',
      )}
      style={customStyle}
      onClick={handleClick}
    >
      <div className={cx('left-side')}>{leftSide}</div>
      <div className={cx('right-side')}>{rightSide}</div>
    </div>
  );
};

AutoLabelingListItemContainer.defaultProps = {
  disabled: false,
  selected: false,
  create: false,
  isLoading: false,
  leftSide: <></>,
  rightSide: <></>,
  customStyle: {},
  children: <></>,
  onClick: (e: React.MouseEvent<HTMLDivElement>) => {},
};

export default AutoLabelingListItemContainer;
