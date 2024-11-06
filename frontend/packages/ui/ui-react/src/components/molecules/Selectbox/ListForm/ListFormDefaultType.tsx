import { useEffect, useRef, forwardRef } from 'react';
import i18n from 'react-i18next';
import { Properties as CSSProperties } from 'csstype';

// Types
import { ListType } from '../types';

// Utils
import { arrayToString, theme as tm } from '@src/utils';

import { useIntersectionObserver } from '@src/hooks/useIntersectionObserver';

// CSS Module
import classNames from 'classnames/bind';
import style from '../Selectbox.module.scss';
const cx = classNames.bind(style);

type Props = {
  type: string;
  list: ListType[];
  selectedIdx: number;
  theme: ThemeType;
  backgroundColor?: string;
  fontStyle?: CSSProperties;
  scrollObserver: ((is?: boolean) => void) | undefined;
  onSelect: (idx: number, e: React.MouseEvent) => void;
  onListController: (
    e: React.KeyboardEvent<HTMLUListElement>,
    selectboxType: string,
  ) => void;
  t?: i18n.TFunction<'translation'>;
};

const ListFormDefaultType = forwardRef<HTMLUListElement, Props>(
  (
    {
      type,
      list,
      selectedIdx,
      theme,
      fontStyle,
      backgroundColor,
      onSelect,
      onListController,
      scrollObserver,
      t,
    },
    ref,
  ) => {
    const testRef = useRef<HTMLLIElement>(null);
    const observer = useIntersectionObserver(testRef, {});

    useEffect(() => {
      if (
        scrollObserver &&
        !observer?.isIntersecting &&
        observer?.isIntersecting !== undefined
      ) {
        scrollObserver(observer?.isIntersecting);
      }
    }, [observer, scrollObserver]);

    return (
      <ul
        ref={ref}
        tabIndex={-1}
        onKeyDown={(e) => {
          onListController(e, type);
        }}
        className={cx(theme)}
        style={{
          backgroundColor,
        }}
      >
        {list.map((curMenu: ListType, idx: number) => {
          const iconAlign = curMenu.iconAlign || 'left';
          let ref;
          if (list.length < 4 && idx === list.length - 1) ref = testRef;
          else if (idx === 4) ref = testRef;

          return (
            <li
              key={`${curMenu.value}-${idx}`}
              className={cx(
                selectedIdx === idx && theme === tm.PRIMARY_THEME && 'hover',
                theme,
                curMenu.isDisable && 'disabled',
              )}
              onClick={(e: React.MouseEvent<HTMLLIElement>) => {
                if (!curMenu.isDisable) {
                  onSelect(idx, e);
                }
              }}
              style={{
                backgroundColor,
              }}
              ref={ref}
            >
              {curMenu.icon && iconAlign === 'left' && (
                <img
                  src={curMenu.icon}
                  className={cx('icon', 'left')}
                  alt='list-icon'
                  style={curMenu.iconStyle}
                />
              )}
              <span style={fontStyle}>{arrayToString(curMenu.label, t)}</span>
              {curMenu.icon && curMenu.iconAlign === 'right' && (
                <img
                  src={curMenu.icon}
                  className={cx('icon', 'right')}
                  alt='list-icon'
                  style={curMenu.iconStyle}
                />
              )}
              {curMenu.StatusIcon && (
                <span className={cx('status')}>
                  <curMenu.StatusIcon />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    );
  },
);

ListFormDefaultType.defaultProps = {
  fontStyle: undefined,
  backgroundColor: undefined,
  t: undefined,
};

export default ListFormDefaultType;
