import { useGetClass, useGetTextDetail } from '@tools/hooks';

import styles from './LabelTextPage.module.scss';
import classNames from 'classnames/bind';

import { EmptyTemplate, TextLabelTemplate } from '@tools/components/templates';

const cx = classNames.bind(styles);

// /common/labling/text/:jid
function LabelTextPage() {
  const detail = useGetTextDetail();
  const classes = useGetClass();

  return (
    <>
      <div className={cx('LabelTextPage')}>
        {detail ? (
          <TextLabelTemplate detail={detail} classes={classes} />
        ) : (
          <EmptyTemplate />
        )}
      </div>
    </>
  );
}

export default LabelTextPage;
