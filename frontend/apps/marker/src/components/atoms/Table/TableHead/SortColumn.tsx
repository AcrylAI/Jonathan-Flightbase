import { useRecoilValue } from 'recoil';

import { TableHeaderSortAtom } from '@src/stores/components/Table/TableAtom';

import { ArrowBottom, ArrowTop } from '@src/static/images';

import styles from './SortColumn.module.scss';
import classNames from 'classnames/bind';
import { Sypo } from '../../Typography/Typo';
import { BLUE110 } from '@src/utils/color';
const cx = classNames.bind(styles);

type Props = {
  title: string;
  onClickHandler: React.Dispatch<React.SetStateAction<number>>;
  idx: number;
};

function SortColumn({ title, onClickHandler, idx }: Props) {
  const sortClickFlag = useRecoilValue(TableHeaderSortAtom);
  return (
    <div onClick={() => onClickHandler(idx)} className={cx('container')}>
      <div className={cx('title')}>
        <Sypo type='P1' weight='M' color={BLUE110}>
          {title}
        </Sypo>
      </div>
      <div className={cx('sort')}>
        <img
          className={cx(sortClickFlag[idx] && 'dark')}
          src={ArrowTop}
          alt=''
        />
        <img
          className={cx(
            !sortClickFlag[idx] && sortClickFlag[idx] !== undefined && 'dark',
          )}
          src={ArrowBottom}
          alt=''
        />
      </div>
    </div>
  );
}

export default SortColumn;
