import DepthItem from './DepthItem';

import styles from './ClassDepth.module.scss';
import classNames from 'classnames/bind';

import useNERClasses from '@tools/hooks/utils/useNERClasses';
import { ClassesResultType } from '@tools/types/fetch';

const cx = classNames.bind(styles);

type Props = {
  list: Array<ClassesResultType>;
};

function ClassDepth({ list }: Props) {
  const {
    selectedId,
    onClickClass,
    primaryClass,
    secondaryClass,
    tertiaryClass,
  } = useNERClasses(list);

  return (
    <div className={cx('classdepth-container')}>
      <div className={cx('classdepth-block')}>
        {primaryClass.map((v, i) => (
          <DepthItem
            item={v}
            selected={selectedId[0] === v.id}
            onClick={() => onClickClass(0, v.id)}
            iconShow
            key={`depth${v.id}${i}`}
          />
        ))}
      </div>

      {selectedId[0] !== 0 && (
        <div className={cx('classdepth-block')}>
          {secondaryClass.map((v, i) => (
            <DepthItem
              item={v}
              selected={selectedId[1] === v.id}
              onClick={() => onClickClass(1, v.id)}
              key={`depth${v.id}${i}`}
            />
          ))}
        </div>
      )}

      {selectedId[1] !== 0 && (
        <div className={cx('classdepth-block')}>
          {tertiaryClass.map((v, i) => (
            <DepthItem
              item={v}
              selected={selectedId[2] === v.id}
              onClick={() => onClickClass(2, v.id)}
              key={`depth${v.id}${i}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ClassDepth;
