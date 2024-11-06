import { useState } from 'react';

import { Sypo } from '@src/components/atoms';

import LabelItem from './LabelItem';

import styles from './LabelList.module.scss';
import classNames from 'classnames/bind';

import { CareRightIcon } from '@tools/assets/CommonIcon';
import { CollapseView } from '@tools/components/view';
import { CommonProps } from '@tools/types/components';
import { LabelType } from '@tools/types/label';

const cx = classNames.bind(styles);

type Props = {
  item?: LabelType;
} & CommonProps;

function LabelGroup({ item, children, className, style }: Props) {
  const [open, setOpen] = useState(false);

  const onClickOpen = () => {
    setOpen(!open);
  };

  return (
    <div
      className={cx('labelgroup-container', { open }, className)}
      style={style}
    >
      <LabelItem onClick={onClickOpen}>
        <div className={cx('labelgroup-header')}>
          <CareRight />
          <Sypo type='p1' weight='r'>
            {children} ({item?.annotation.length ?? 0})
          </Sypo>
        </div>
      </LabelItem>

      <CollapseView open={open}>
        <div className={cx('labelgroup-item')}>
          {item?.annotation.map((v, i) => (
            <LabelItem key={`LabelItem_${v.id}_${i}`}>
              {`${item?.className}_${v.id}`}
            </LabelItem>
          ))}
        </div>
      </CollapseView>
    </div>
  );
}

export type { Props as LabelGroupPropType };

export default LabelGroup;

function CareRight({ className }: Pick<CommonProps, 'className'>) {
  return (
    <div className={className} style={{ color: '#82868E' }}>
      <CareRightIcon />
    </div>
  );
}
