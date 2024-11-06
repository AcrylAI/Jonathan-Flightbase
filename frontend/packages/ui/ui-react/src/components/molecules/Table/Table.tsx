import { useState, useEffect, useCallback } from 'react';

// Custom Hooks
import usePaiging from './usePaging';

// Components
import TableHeader from './TableHeader';
import TableBody from './TableBody';

// Types
import { TableArgs } from './types';

// CSS Module
import classNames from 'classnames/bind';
import style from './Table.module.scss';
const cx = classNames.bind(style);

function Table({
  columns,
  data,
  isCheck,
  headerStyle,
  bodyStyle,
  isPageNation,
  pageRowCnt,
  PagingBtn,
  pagingBtnAlign,
  loading = true,
  InputSortIcon,
  getCheckedIndex,
}: TableArgs) {
  // Component State
  const [checked, setChecked] = useState<any>(new Set());
  const [filteredData, setFilteredData] = useState<Array<any>>([]);
  const [ascending, setAscending] = useState(false);

  // Custom Hooks
  const [loc, renderPagination] = usePaiging({
    dataSize: data?.length || 0,
    rowSize: pageRowCnt,
    pagingBtnAlign,
    PagingBtn,
  });

  // Events
  const checkHandler = (idx: number): void => {
    if (data && idx === -1) {
      data.forEach((_, i) => {
        if (!checked.has(i)) checked.add(i);
      });
    } else if (idx === -2) {
      checked.clear();
    } else {
      if (checked.has(idx)) {
        checked.delete(idx);
      } else {
        checked.add(idx);
      }
    }
    setChecked((prev: any) => {
      if (getCheckedIndex) getCheckedIndex([...prev]);
      return new Set(prev);
    });
  };

  const isAllChecked = checked.size === data?.length;

  const pagingCnt = useCallback((): Array<any> => {
    if (data && isPageNation && pageRowCnt)
      return data.slice(loc * pageRowCnt, (loc + 1) * pageRowCnt);
    return data || [];
  }, [loc, data, isPageNation, pageRowCnt]);

  const sortHandler = (selector: string) => {
    if (ascending) {
      // 오름차순 정렬
      setFilteredData((filteredData) => {
        return filteredData.sort((prev, next) => {
          const uPrev = String(prev[selector]).toUpperCase();
          const uNext = String(next[selector]).toUpperCase();
          if (uPrev > uNext) return 1;
          if (uPrev < uNext) return -1;
          return 0;
        });
      });
    } else {
      // 내림차순 정렬
      setFilteredData((filteredData) => {
        return filteredData.sort((prev, next) => {
          const uPrev = String(prev[selector]).toUpperCase();
          const uNext = String(next[selector]).toUpperCase();
          if (uPrev < uNext) return 1;
          if (uPrev > uNext) return -1;
          return 0;
        });
      });
    }
    setAscending((ascending) => !ascending);
  };

  useEffect(() => {
    setFilteredData(pagingCnt());
  }, [pagingCnt]);

  return (
    <div className={cx('table-wrapper')}>
      <div className={cx('table')}>
        <TableHeader
          columns={columns}
          isCheck={isCheck}
          InputSortIcon={InputSortIcon}
          isAllChecked={isAllChecked}
          headerStyle={headerStyle}
          checkHandler={checkHandler}
          sortHandler={sortHandler}
        />
        <TableBody
          columns={columns}
          data={filteredData}
          isCheck={isCheck}
          checked={checked}
          bodyStyle={bodyStyle}
          isPageNation={isPageNation}
          loading={loading}
          checkHandler={checkHandler}
        />
      </div>
      {isPageNation && <div>{renderPagination()}</div>}
    </div>
  );
}

export default Table;
