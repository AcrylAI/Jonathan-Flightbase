import { useState } from 'react';

import ClassItem from './ClassItem';

import styles from './ClassList.module.scss';
import classNames from 'classnames/bind';

import { ClassType } from '@tools/types/classes';

const cx = classNames.bind(styles);

type Props = {
  list: Array<ClassType>;
};

function ClassList({ list }: Props) {
  const [currentClassId, setCurrentClassId] = useState<number>(0);

  const onClick = (id: number) => {
    setCurrentClassId(id);
  };

  return (
    <div className={cx('classlist-container')}>
      {list.map((v) => (
        <ClassItem
          key={`${v.id}_${v.name}`}
          item={v}
          onClick={() => onClick(v.id)}
          selected={currentClassId === v.id}
        />
      ))}
    </div>
  );
}

export type { Props as ClassListPropType };

export default ClassList;
