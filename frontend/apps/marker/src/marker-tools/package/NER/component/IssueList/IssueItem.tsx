import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { cloneDeep } from 'lodash';

import { Sypo } from '@src/components/atoms';

import { CareRight, Checks, Delete } from './IssueIcons';

import styles from './IssueList.module.scss';
import classNames from 'classnames/bind';

import { CollapseView } from '@tools/components/view';
import { usePostJobIssue } from '@tools/hooks/api';
import { issueListAtom } from '@tools/store';
import { TextAnnotationType } from '@tools/types/annotation';

const cx = classNames.bind(styles);

type Props = {
  user: string;
  issue: TextAnnotationType;
  editable: boolean;
};

function IssueItem({ user, issue, editable }: Props) {
  const [resolved, setResolved] = useState<boolean>(issue.status === 1);
  const [open, setOpen] = useState(false);
  const setIssues = useSetRecoilState<Array<TextAnnotationType>>(issueListAtom);
  const { postIssueResolve } = usePostJobIssue();

  const onClickOpen = () => {
    setOpen(!open);
  };

  // TODO: check 관련 API 확인할 것
  const onClickChecks = async () => {
    const result = await postIssueResolve(issue.id);

    if (result?.httpStatus === 200) {
      setResolved(true);
    }
  };

  const onClickDelete = () => {
    setIssues((prev) => {
      const fidx = prev.findIndex((v) => v.id === issue.id);

      if (fidx === -1) {
        return prev;
      }
      const curr = cloneDeep(prev);
      curr.splice(fidx, 1);
      return curr;
    });
  };

  return (
    <div className={cx('issuebox-container', { resolved })}>
      <div className={cx('issuebox-header')}>
        <div className={cx('issuebox-area')} onClick={onClickOpen}>
          <CareRight className={cx('issuebox-arrow', { open })} />
          <Sypo type='p1' weight='r' color='#646870'>
            {user}
          </Sypo>
        </div>
        {editable && (
          <div className={cx('issuebox-area')}>
            {issue.id > 0 && (
              <Checks
                className={cx('issuebox-check')}
                onClick={onClickChecks}
              />
            )}
            <Delete className={cx('issuebox-delete')} onClick={onClickDelete} />
          </div>
        )}
      </div>

      <CollapseView open={open} minimum={33}>
        <div className={cx('issuebox-contents')}>
          <span className={cx('issue-comment', { close: !open })}>
            {issue.comment && issue.comment.length > 0
              ? issue.comment
              : 'empty'}
          </span>
        </div>
      </CollapseView>
    </div>
  );
}

export default IssueItem;
