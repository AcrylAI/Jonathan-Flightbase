import { useState } from 'react';

// Components
import Pagination from './Pagination';

// Types
import { PagingHookArgs } from './types';

const usePaiging = ({
  dataSize,
  rowSize,
  pagingBtnAlign = 'left',
  PagingBtn,
}: PagingHookArgs): [number, () => JSX.Element] => {
  const [loc, setLoc] = useState(0);

  const pageHandler = (action: string) => {
    if (rowSize && action === 'next' && (loc + 1) * rowSize < dataSize) {
      setLoc(loc + 1);
    } else if (rowSize && action === 'prev' && (loc + 1) * rowSize > rowSize) {
      setLoc(loc - 1);
    }
  };
  const moveEdgePage = (action: string) => {
    if (rowSize && action === 'last') {
      setLoc(Math.floor(dataSize / rowSize));
    } else if (rowSize && action === 'first') {
      setLoc(0);
    }
  };
  const paginationRender = (): JSX.Element => (
    <Pagination
      loc={loc}
      pageHandler={pageHandler}
      moveEdgePage={moveEdgePage}
      pagingBtnAlign={pagingBtnAlign}
      PagingBtn={PagingBtn}
    />
  );

  return [loc, paginationRender];
};

export default usePaiging;
