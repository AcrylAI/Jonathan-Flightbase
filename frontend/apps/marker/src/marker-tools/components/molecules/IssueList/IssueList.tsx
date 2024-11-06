import styles from './IssueList.module.scss';
import classNames from 'classnames/bind';

import { IssueItem } from '@tools/components/molecules/IssueList/index';
import { IssueType } from '@tools/types/label';

const cx = classNames.bind(styles);

type Props = {
  list: Array<IssueType>;
};

function IssueList({ list }: Props) {
  return (
    <div className={cx('issuelist-container')}>
      {list.map((v, i) => (
        <IssueItem
          key={`${v.user_id}_${v.id}_${i}`}
          user={v.user_id}
          issue={v}
        />
      ))}
    </div>
  );
}

export type { Props as IssueListPropType };

export default IssueList;
