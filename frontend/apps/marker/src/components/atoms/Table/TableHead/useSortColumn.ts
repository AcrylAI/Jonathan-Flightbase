import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import { TableHeaderSortAtom } from '@src/stores/components/Table/TableAtom';

function useSortColumn(count: number) {
  const [sortClickFlag, setSortClickFlag] = useRecoilState(TableHeaderSortAtom);

  const onClickHandler = (num: number, sortDirection: string) => {
    const temp = _.cloneDeep(sortClickFlag);
    temp.forEach((item, idx) => {
      if (idx === num) {
        if (sortDirection === 'DESC') {
          temp[idx] = false;
        } else temp[idx] = true;
      } else temp[idx] = undefined;
    });
    setSortClickFlag(temp);
  };

  useEffect(() => {
    setSortClickFlag(Array.from(Array(count)).fill(undefined));
  }, []);

  return [onClickHandler];
}
export default useSortColumn;
