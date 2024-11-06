import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { Sypo } from '@src/components/atoms';

import LabelItem from './LabelItem';

import styles from './LabelList.module.scss';
import classNames from 'classnames/bind';

import { CareRightIcon } from '@tools/assets/CommonIcon';
import { CollapseView } from '@tools/components/view';
import { selectedClassAtom } from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';
import { CommonProps } from '@tools/types/components';
import { JobDetailResultType } from '@tools/types/fetch';
import {
  INSPECTION_FILESTATE,
  REJECTION_FILESTATE,
  WORKING_FILESTATE,
} from '@tools/types/literal';
import { getUser } from '@tools/utils';
import { v4 as uuidV4 } from 'uuid';

const cx = classNames.bind(styles);

type Props = {
  item: Array<TextAnnotationType>;
  className: string;
} & Pick<
  JobDetailResultType<TextAnnotationType>,
  'labelerName' | 'reviewerName' | 'fileStatus'
>;

function LabelGroup({
  item,
  className,
  labelerName,
  reviewerName,
  fileStatus,
}: Props) {
  const [uuid, setUuid] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const selectedClass = useRecoilValue(selectedClassAtom);

  const onClickOpen = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (!item || item.length === 0 || !selectedClass) return;
    if (item[0].classId === selectedClass.id) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [item, selectedClass]);

  useEffect(() => {
    if (open && uuid) {
      setTimeout(() => {
        document.getElementById(uuid)?.scrollIntoView({ behavior: 'smooth' });
      }, 140)
    }
  }, [open, uuid]);

  useEffect(() => {
    setUuid(`labelgroup_${uuidV4()}`);
  }, []);

  const pathname = useLocation().pathname.split('/');
  const currentUser = getUser();
  const allowByManager = (() => {
    if (
      fileStatus === WORKING_FILESTATE ||
      fileStatus === REJECTION_FILESTATE
    ) {
      return currentUser === labelerName;
    }
    if (fileStatus === INSPECTION_FILESTATE) {
      return currentUser === reviewerName;
    }
    return false;
  })();
  const allowByPath = ((allowPath: string | Array<string>) => {
    if (typeof allowPath === 'string') {
      return pathname[2] === allowPath;
    }

    return allowPath.includes(pathname[2]);
  })(['labeling', 'inspection']);

  return (
    <div className={cx('labelgroup-container', { open })} id={uuid}>
      <LabelItem onClick={onClickOpen} cursor>
        <div className={cx('labelgroup-header')}>
          <CareRight className={cx('labelgroup-icon')} />
          <Sypo type='p1' weight='r'>
            {className} ({item.length ?? 0})
          </Sypo>
        </div>
      </LabelItem>

      <CollapseView open={open}>
        <div className={cx('labelgroup-item')}>
          {item.map((v, i) => (
            <LabelItem
              key={`LabelItem_${v.id}_${i}`}
              label={v}
              allowByManager={allowByManager}
              allowByPath={allowByPath}
            />
          ))}
        </div>
      </CollapseView>
    </div>
  );
}

export default LabelGroup;

function CareRight({ className }: Pick<CommonProps, 'className'>) {
  return (
    <div className={className} style={{ color: '#82868E' }}>
      <CareRightIcon />
    </div>
  );
}
