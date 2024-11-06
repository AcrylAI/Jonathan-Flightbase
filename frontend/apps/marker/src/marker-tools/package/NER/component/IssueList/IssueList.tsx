import { useRecoilValue } from 'recoil';

import IssueItem from './IssueItem';

import styles from './IssueList.module.scss';
import classNames from 'classnames/bind';

import { useEventDisable } from '@tools/hooks/utils';
import { issueListAtom } from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';
import { JobDetailResultType } from '@tools/types/fetch';
import { INSPECTION_FILESTATE } from '@tools/types/literal';

const cx = classNames.bind(styles);

type Props = {
  detail: JobDetailResultType<TextAnnotationType>;
};

function IssueList({ detail }: Props) {
  const issues = useRecoilValue<Array<TextAnnotationType>>(issueListAtom);
  const { allowBySameUser, allowByFileStatus } = useEventDisable(detail);

  return (
    <div className={cx('issuelist-container')}>
      {issues.map((v, i) => (
        <IssueItem
          key={`${v.id}_${v.text}_${i}`}
          user={detail.reviewerName ?? ''}
          issue={v}
          editable={
            allowByFileStatus(INSPECTION_FILESTATE) &&
            allowBySameUser(detail.reviewerName)
          }
        />
      ))}
    </div>
  );
}

export default IssueList;
