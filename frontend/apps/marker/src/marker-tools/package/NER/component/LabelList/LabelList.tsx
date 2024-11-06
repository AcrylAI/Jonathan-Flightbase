import { useRecoilValue } from 'recoil';

import LabelGroup from './LabelGroup';

import styles from './LabelList.module.scss';
import classNames from 'classnames/bind';

import { labelListAtom } from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';
import { ClassesResultType, JobDetailResultType } from '@tools/types/fetch';

const cx = classNames.bind(styles);

type Props = {
  classes: Array<ClassesResultType>;
  detail: JobDetailResultType<TextAnnotationType>;
};

function LabelList({ classes, detail }: Props) {
  const labels = useRecoilValue<Array<TextAnnotationType>>(labelListAtom);

  const classIdList = labels
    .map((v) => v.classId)
    .filter((v, i, a) => a.indexOf(v) === i);

  const getLabelById = (classId: number) => {
    return labels.filter((v) => v.classId === classId);
  };

  const getClassNameById = (classId: number) => {
    const tertriary = classes.find((v) => v.id === classId);
    const secondary = classes.find((v) => v.id === tertriary?.parent_id);
    const primary = classes.find((v) => v.id === secondary?.parent_id);

    return `${primary?.name}/${secondary?.name}/${tertriary?.name}`;
  };

  return (
    <div className={cx('labellist-container')}>
      {classIdList.map((v, i) => (
        <LabelGroup
          item={getLabelById(v)}
          className={getClassNameById(v)}
          labelerName={detail.labelerName}
          fileStatus={detail.fileStatus}
          reviewerName={detail.reviewerName}
          key={`LabelGroup_${v}_${i}`}
        />
      ))}
    </div>
  );
}

export default LabelList;
