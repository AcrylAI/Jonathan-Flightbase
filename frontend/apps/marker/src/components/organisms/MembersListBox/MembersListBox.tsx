import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import { Case, Default, Switch } from '@jonathan/react-utils';

import {
  ProjectMembersContentsAtom,
  ProjectMembersContentsAtomModel,
} from '@src/stores/components/pageContents/ProjectMembersContentsAtom/ProjectMembersContentsAtom';

import { Sypo } from '@src/components/atoms';

import { MemberInfoTypes } from '@src/components/pageContents/ProjectMembersContents/ProjectMembersContents';

// i18n
import useT from '@src/hooks/Locale/useT';

import MemberItem from './MemberItem';
import SelectMenuButton from './SelectMenuButton';

import styles from './MembersListBox.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  memberList: Array<MemberInfoTypes>;
  noReviewProject: boolean;
};

const MembersListBox = ({ memberList, noReviewProject }: Props) => {
  const { t } = useT();
  const { pid } = useParams();

  const [selectMenu, setSelectMenu] = useState<'All' | 'Labeling' | 'Review'>(
    'All',
  );
  const [projectId, setProjectId] = useState(Number(pid));
  const [state, setState] = useRecoilState<ProjectMembersContentsAtomModel>(
    ProjectMembersContentsAtom,
  );

  const onAllClick = () => {
    setSelectMenu('All');
  };
  const onLabelingClick = () => {
    setSelectMenu('Labeling');
  };
  const onReviewClick = () => {
    setSelectMenu('Review');
  };

  const onTotalClick = () => {
    const cur = _.cloneDeep(state);
    cur.selectedId = undefined;
    setState(cur);
  };

  const labelingMember = memberList?.filter((data) => data.labeling === 1);
  const reviewMember = memberList?.filter((data) => data.review === 1);

  return (
    <div className={cx('container')}>
      <div className={cx('inner-container')}>
        <SelectMenuButton
          onAllClick={onAllClick}
          onLabelingClick={onLabelingClick}
          onReviewClick={onReviewClick}
          selectMenu={selectMenu}
          noReviewProject={noReviewProject}
        />
        <div
          className={cx(
            'total-info-button',
            state.selectedId === undefined && 'active',
          )}
          onClick={onTotalClick}
        >
          <Sypo type='P1'>{t(`component.list.projectTotal`)}</Sypo>
        </div>
        {memberList && (
          <Switch>
            <Case condition={selectMenu === 'Labeling'}>
              {labelingMember.map((item, index) => (
                <MemberItem
                  key={`member-item-${index}`}
                  projectId={projectId}
                  memberItem={item}
                />
              ))}
            </Case>
            <Case condition={selectMenu === 'Review'}>
              {reviewMember.map((item, index) => (
                <MemberItem
                  key={`member-item-${index}`}
                  projectId={projectId}
                  memberItem={item}
                  selectMenu={selectMenu}
                />
              ))}
            </Case>
            <Default condition={selectMenu === 'All'}>
              {memberList.map((item, index) => (
                <MemberItem
                  key={`member-item-${index}`}
                  projectId={projectId}
                  memberItem={item}
                />
              ))}
            </Default>
          </Switch>
        )}
      </div>
    </div>
  );
};

export default MembersListBox;
