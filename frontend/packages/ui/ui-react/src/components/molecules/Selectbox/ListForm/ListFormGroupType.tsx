import { forwardRef } from 'react';
import i18n from 'react-i18next';
import { Properties as CSSProperties } from 'csstype';

// Types
import { ListType } from '../types';

// Utils
import { arrayToString } from '@src/utils';

// CSS Module
import classNames from 'classnames/bind';
import style from '../Selectbox.module.scss';
const cx = classNames.bind(style);

type Props = {
  type: string;
  list: ListType[];
  selectedIdx: number;
  fontStyle?: CSSProperties;
  theme: ThemeType;
  backgroundColor?: string;
  onSelect: (idx: number, e: React.MouseEvent) => void;
  onListController: (
    e: React.KeyboardEvent<HTMLUListElement>,
    selectboxType: string,
  ) => void;
  t?: i18n.TFunction<'translation'>;
};

const ListFormGroupType = forwardRef<HTMLUListElement, Props>(
  (
    {
      type,
      list,
      selectedIdx,
      fontStyle,
      theme,
      backgroundColor,
      onSelect,
      onListController,
      t,
    },
    ref,
  ) => {
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
          return (
            <li
              key={`${curMenu.value}-${idx}`}
              className={cx(
                selectedIdx === idx && 'hover',
                curMenu.isTitle && 'title',
              )}
              onClick={(e: React.MouseEvent<HTMLLIElement>) => {
                if (!curMenu.isTitle) onSelect(idx, e);
              }}
            >
              {curMenu.isTitle ? (
                <>
                  {curMenu.icon && iconAlign === 'left' && (
                    <img
                      className={cx('icon', 'left', 'title')}
                      src={curMenu.icon}
                      alt='list-icon'
                      style={curMenu.iconStyle}
                    />
                  )}
                  {idx > 0 && <div className={cx('divide-line')}></div>}
                  <span className={cx('title-label')} style={fontStyle}>
                    {arrayToString(curMenu.label, t)}
                  </span>
                  {curMenu.icon && curMenu.iconAlign === 'right' && (
                    <img
                      src={curMenu.icon}
                      alt='list-icon'
                      className={cx('icon', 'right', 'title')}
                      style={curMenu.iconStyle}
                    />
                  )}
                </>
              ) : (
                <>
                  {curMenu.icon && iconAlign === 'left' && (
                    <img
                      src={curMenu.icon}
                      alt='list-icon'
                      className={cx('icon', 'left')}
                      style={curMenu.iconStyle}
                    />
                  )}
                  <span style={fontStyle}>
                    {arrayToString(curMenu.label, t)}
                  </span>
                  {curMenu.icon && curMenu.iconAlign === 'right' && (
                    <img
                      className={cx('icon', 'right')}
                      src={curMenu.icon}
                      alt='list-icon'
                      style={curMenu.iconStyle}
                    />
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    );
  },
);

ListFormGroupType.defaultProps = {
  fontStyle: undefined,
  backgroundColor: undefined,
  t: undefined,
};

export default ListFormGroupType;
