import { useGetClass, useGetTextDetail } from '@tools/hooks';

import styles from './LabelTextPage.module.scss';
import classNames from 'classnames/bind';

import {
  EmptyTemplate,
  TextInspectionTemplate,
} from '@tools/components/templates';

const cx = classNames.bind(styles);

// /common/labling/text/:jid
function ReviewTextPage() {
  const detail = useGetTextDetail();
  const classes = useGetClass();

  return (
    <div className={cx('LabelTextPage')}>
      {detail ? (
        <TextInspectionTemplate detail={detail} classes={classes} />
      ) : (
        <EmptyTemplate />
      )}
    </div>
  );
}

export default ReviewTextPage;
