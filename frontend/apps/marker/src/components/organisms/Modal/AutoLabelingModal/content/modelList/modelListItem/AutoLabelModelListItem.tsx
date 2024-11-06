import styles from './AutoLabelModelListItem.module.scss';
import classNames from 'classnames/bind';
import { AutoLabelModalListItemModel } from '@src/stores/components/Modal/SetAutoLabelModalAtom';
import Radio from '@src/components/atoms/Input/Radio/Radio';
import React from 'react';
import { Sypo } from '@src/components/atoms';

const cx = classNames.bind(styles);

type AutoLabelModelListItemProps = {
  item: AutoLabelModalListItemModel;
  selected: boolean;
  setSelected: (idx: number) => void;
};
const AutoLabelModelListItem = ({
  item,
  selected,
  setSelected,
}: AutoLabelModelListItemProps) => {
  const onChangeSelected = (e: React.MouseEvent<HTMLDivElement>) => {
    if (item.worker > 0) {
      setSelected(item.id);
    }
  };
  return (
    <div className={cx('item-container')} onClick={onChangeSelected}>
      <div className={cx('radio')}>
        <Radio selected={selected} disabled={item.worker === 0} />
      </div>
      <div className={cx('model')}>
        <Sypo type='P1' weight='regular'>
          {item.modelName}
        </Sypo>
      </div>
      <div className={cx('d-name')}>
        <Sypo type='P1' weight='regular'>
          {item.deployName}
        </Sypo>
      </div>
      <div className={cx('d-owner')}>
        <Sypo type='P1' weight='regular'>
          {item.owner}
        </Sypo>
      </div>
      <div className={cx('resource')}>
        <div className={cx('box', item.worker > 0 && 'active')}>
          <Sypo type='P2'>{`Worker*${item.worker}`}</Sypo>
        </div>
      </div>
    </div>
  );
};

export default AutoLabelModelListItem;
