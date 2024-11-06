import LabelGroup from './LabelGroup';

import styles from './LabelList.module.scss';
import classNames from 'classnames/bind';

import { LabelType } from '@tools/types/label';

const cx = classNames.bind(styles);

type Props = {
  labels: Array<LabelType>;
};

function LabelList({ labels }: Props) {
  return (
    <div className={cx('labellist-container')}>
      {labels.map((v, i) => (
        <LabelGroup key={`${v.className}_${i}`} item={v} />
      ))}
    </div>
  );
}

export type { Props as LabelListPropType };

export default LabelList;
