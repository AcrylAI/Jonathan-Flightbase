// Components
import Checkbox from '@src/components/atoms/button/Checkbox';

// Types
import { TableBodyArgs } from '../types';

// Icon
import loadingIcon from '@src/static/images/icons/spinner-1s-58.svg';

// CSS Module
import classNames from 'classnames/bind';
import style from './TableBody.module.scss';
const cx = classNames.bind(style);

function TableBody({
  data,
  columns,
  checked,
  isCheck,
  bodyStyle,
  loading,
  checkHandler,
}: TableBodyArgs) {
  return (
    <div
      className={cx(
        'body',
        bodyStyle?.scrollbarColor ? bodyStyle.scrollbarColor : 'light',
      )}
      style={{
        backgroundColor: bodyStyle?.backgroundColor,
      }}
    >
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <img src={loadingIcon} alt='Loading...' />
        </div>
      ) : (
        data &&
        data.map((d, k1) => (
          <div className={cx('row', bodyStyle?.visibleLine && 'line')} key={k1}>
            {isCheck && (
              <div
                className={cx(
                  'td',
                  'checkbox',
                  bodyStyle?.visibleCellLine && 'cell',
                )}
              >
                <Checkbox
                  onChange={() => {
                    checkHandler(k1);
                  }}
                  checked={checked.has(k1)}
                />
              </div>
            )}
            {columns.map(({ cell, selector }, k2) => (
              <div
                className={cx('td', bodyStyle?.visibleCellLine && 'cell')}
                key={k2}
              >
                <div
                  className={cx('inner-item')}
                  style={{
                    color: bodyStyle?.fontColor,
                  }}
                >
                  {/* {cell ? cell : selector && d[selector]} */}
                  {selector && d[selector]}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
      <div
        className={cx('cover-scrollbar')}
        style={{
          backgroundColor: bodyStyle?.backgroundColor,
        }}
      ></div>
    </div>
  );
}

export default TableBody;
