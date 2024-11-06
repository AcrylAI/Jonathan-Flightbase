// Components
import Checkbox from '@src/components/atoms/button/Checkbox';
import SortIcon from './SortIcon';

// Types
import { TableHeaderArgs } from '../types';

// CSS Module
import classNames from 'classnames/bind';
import style from './TableHeader.module.scss';
const cx = classNames.bind(style);

function TableHeader({
  columns,
  isCheck,
  isAllChecked,
  InputSortIcon,
  headerStyle,
  checkHandler,
  sortHandler,
}: TableHeaderArgs) {
  return (
    <div
      className={cx('header')}
      style={{
        backgroundColor: headerStyle?.backgroundColor,
      }}
    >
      <div className={cx('row')}>
        {isCheck && (
          <div className={cx('th', 'checkbox')}>
            <Checkbox
              checked={isAllChecked}
              onChange={() => {
                checkHandler(isAllChecked ? -2 : -1);
              }}
            />
          </div>
        )}
        {columns.map(({ name, selector, sortable, cell }, key) => (
          <div className={cx('th')} key={`${name}-${key}`}>
            <div
              className={cx('inner-item')}
              style={{ color: headerStyle?.fontColor }}
            >
              {name}
              {InputSortIcon ? (
                <InputSortIcon />
              ) : (
                <SortIcon
                  onClick={() => {
                    if (sortHandler && selector) sortHandler(selector);
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableHeader;
