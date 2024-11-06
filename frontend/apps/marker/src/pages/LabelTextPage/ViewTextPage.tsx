import { useGetClass, useGetTextDetail } from '@tools/hooks';

import styles from './LabelTextPage.module.scss';
import classNames from 'classnames/bind';

import { EmptyTemplate, TextViewTemplate } from '@tools/components/templates';

const cx = classNames.bind(styles);

// /common/labling/text/:jid
function ViewTextPage() {
  const detail = useGetTextDetail();
  const classes = useGetClass();

  return (
    <div className={cx('LabelTextPage')}>
      {detail ? (
        <TextViewTemplate detail={detail} classes={classes} />
      ) : (
        <EmptyTemplate />
      )}
    </div>
  );
}

export default ViewTextPage;
