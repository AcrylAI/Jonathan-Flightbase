import { useState } from 'react';

import { Sypo } from '@src/components/atoms';

import { CareRight, Checks, Delete } from './IssueIcons';

import styles from './IssueList.module.scss';
import classNames from 'classnames/bind';

import { CollapseView } from '@tools/components/view';
import { IssueType } from '@tools/types/label';

const cx = classNames.bind(styles);

type Props = {
  user: string;
  issue: IssueType;
};

function IssueItem({ user, issue }: Props) {
  const [open, setOpen] = useState(false);

  const onClickOpen = () => {
    setOpen(!open);
  };

  const onClickChecks = () => {
    console.log('check');
  };

  const onClickDelete = () => {
    console.log('delete');
  };

  return (
    <div className={cx('issuebox-container')}>
      <div className={cx('issuebox-header')}>
        <div className={cx('issuebox-area')} onClick={onClickOpen}>
          <CareRight className={cx('issuebox-arrow', { open })} />
          <Sypo type='p1' weight='r' color='#646870'>
            {user}
          </Sypo>
        </div>
        <div className={cx('issuebox-area')}>
          <Checks className={cx('issuebox-check')} onClick={onClickChecks} />
          <Delete className={cx('issuebox-delete')} onClick={onClickDelete} />
        </div>
      </div>

      <CollapseView open={open} minimum={33}>
        <div className={cx('issuebox-contents')}>
          <span className={cx('issue-comment', { close: !open })}>
            {issue.comment && issue.comment.length > 0
              ? issue.comment
              : 'describing'}
          </span>
        </div>
      </CollapseView>
    </div>
  );
}

export type { Props as IssueItemPropType };

export default IssueItem;
