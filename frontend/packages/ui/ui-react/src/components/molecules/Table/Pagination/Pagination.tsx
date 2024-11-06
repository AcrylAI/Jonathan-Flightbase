// Components
import Button from '@src/components/atoms/button/Button';

// Types
import { PaginationArgs } from '../types';

// CSS Module
import classNames from 'classnames/bind';
import style from './Pagination.module.scss';

const cx = classNames.bind(style);

function Pagination({
  loc,
  pagingBtnAlign,
  PagingBtn,
  pageHandler,
  moveEdgePage,
}: PaginationArgs) {
  return (
    <div className={cx('pagination', pagingBtnAlign)}>
      {PagingBtn?.MoveFirst && (
        <span
          onClick={() => {
            moveEdgePage('first');
          }}
        >
          <PagingBtn.MoveFirst />
        </span>
      )}
      {PagingBtn?.MovePrev && (
        <span
          onClick={() => {
            pageHandler('prev');
          }}
        >
          <PagingBtn.MovePrev />
        </span>
      )}
      <span className={cx('page')}>{loc + 1}</span>
      {PagingBtn?.MoveNext && (
        <span
          onClick={() => {
            pageHandler('next');
          }}
        >
          <PagingBtn.MoveNext />
        </span>
      )}
      {PagingBtn?.MoveLast && (
        <span
          onClick={() => {
            moveEdgePage('last');
          }}
        >
          <PagingBtn.MoveLast />
        </span>
      )}
    </div>
  );
}

Pagination.defaultProps = {
  pagingBtnAlign: 'left',
  PagingBtn: {
    MoveFirst: undefined,
    MoveLast: undefined,
    MovePrev: () => (
      <Button type='secondary' size='small'>
        prev
      </Button>
    ),
    MoveNext: () => (
      <Button type='secondary' size='small'>
        next
      </Button>
    ),
  },
};

export default Pagination;
