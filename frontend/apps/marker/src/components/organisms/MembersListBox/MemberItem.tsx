import { useRecoilState } from 'recoil';
import _ from 'lodash';

import {
  ProjectMembersContentsAtom,
  ProjectMembersContentsAtomModel,
} from '@src/stores/components/pageContents/ProjectMembersContentsAtom/ProjectMembersContentsAtom';

import { Sypo } from '@src/components/atoms';

import { MemberInfoTypes } from '@src/components/pageContents/ProjectMembersContents/ProjectMembersContents';

import styles from './MembersListBox.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  projectId: number;
  memberItem: MemberInfoTypes;
  selectMenu?: string;
};

const MemberItem = ({ projectId, memberItem, selectMenu }: Props) => {
  const labelingStatus = memberItem.labeling === 1;
  const reviewStatus = memberItem.review === 1;
  const [state, setState] = useRecoilState<ProjectMembersContentsAtomModel>(
    ProjectMembersContentsAtom,
  );

  const onClickItem = () => {
    const temp = _.cloneDeep(state);
    temp.projectId = projectId;
    temp.selectedId = memberItem.id;
    temp.selectedName = memberItem.name;
    setState(temp);
  };

  const toUpperCase = (name: string) => {
    const firstString = name.charAt(0);
    const others = name.slice(1);

    return firstString.toUpperCase() + others;
  };

  return (
    <>
      <div
        className={cx(
          'member-item-box',
          memberItem.id === state.selectedId && 'active',
        )}
        onClick={onClickItem}
      >
        <p className={cx('member-name')}>
          <Sypo type='P1'>{toUpperCase(memberItem.name)}</Sypo>
        </p>
        <div
          className={cx(
            'user-status-wrapper',
            selectMenu === 'Review' && 'select-review',
          )}
        >
          {labelingStatus && (
            <div className={cx('user-status', 'status-labeling')}>
              <Sypo type='P2'>Labeling</Sypo>
            </div>
          )}
          {reviewStatus && (
            <div className={cx('user-status', 'status-review')}>
              <Sypo type='P2'>Review</Sypo>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

MemberItem.defaultProps = {
  selectMenu: '',
};

export default MemberItem;
