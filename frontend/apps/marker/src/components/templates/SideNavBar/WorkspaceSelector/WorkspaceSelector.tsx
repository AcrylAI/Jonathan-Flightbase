import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import _ from 'lodash';

import { InputText } from '@jonathan/ui-react';

import { Case, Default, Switch } from '@jonathan/react-utils';
import { ClickAwayListener } from '@jonathan/react-utils';

import { Typo } from '@src/components/atoms/Typography/Typo';

import { MONO204, MONO205 } from '@src/utils/color';
import { ADMIN_URL } from '@src/utils/pageUrls';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

import useDeleteWorkspaceBookmark from './hooks/useDeleteWorkspaceBookmark';
import useGetNavWorkspaceList from './hooks/useGetNavWorkspaceList';
import usePostWorkspaceBookmark from './hooks/usePostWorkspaceBookmark';

import { CarrotSkyBlueIcon, SearchIcon } from '@src/static/images';

import styles from './WorkspaceSelector.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
type StarProps = {
  bookmark: 0 | 1;
};
const StartIcon = ({ bookmark }: StarProps) => {
  return (
    <Switch>
      <Case condition={bookmark}>
        <svg
          width='12'
          height='12'
          viewBox='0 0 10 10'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M9.63319 3.72516C9.59147 3.5939 9.51106 3.47832 9.4025 3.39355C9.29395 3.30879 9.16231 3.25881 9.02485 3.25016L6.54985 3.07933L5.63319 0.766829C5.58313 0.639497 5.49601 0.530123 5.38309 0.452864C5.27018 0.375606 5.13667 0.334022 4.99985 0.333496V0.333496C4.86304 0.334022 4.72953 0.375606 4.61661 0.452864C4.5037 0.530123 4.41657 0.639497 4.36652 0.766829L3.43319 3.09183L0.974852 3.25016C0.837563 3.25937 0.706194 3.30956 0.597741 3.39424C0.489288 3.47893 0.408741 3.5942 0.366519 3.72516C0.323161 3.85813 0.320628 4.00104 0.359246 4.13546C0.397864 4.26988 0.475863 4.38965 0.583186 4.47933L2.47485 6.07933L1.91235 8.29183C1.87343 8.4415 1.88044 8.59943 1.93245 8.74507C1.98447 8.89071 2.07909 9.01734 2.20402 9.1085C2.32528 9.19553 2.46976 9.2444 2.61895 9.24885C2.76815 9.25331 2.91528 9.21314 3.04152 9.1335L4.99569 7.896H5.00402L7.10819 9.22516C7.21612 9.29531 7.34196 9.33291 7.47069 9.3335C7.57579 9.33267 7.6793 9.30776 7.77327 9.26067C7.86724 9.21358 7.94917 9.14558 8.01274 9.06188C8.07632 8.97818 8.11986 8.88102 8.14002 8.77786C8.16018 8.67471 8.15641 8.5683 8.12902 8.46683L7.53319 6.046L9.41652 4.47933C9.52384 4.38965 9.60184 4.26988 9.64046 4.13546C9.67908 4.00104 9.67654 3.85813 9.63319 3.72516Z'
            fill='#2D76F8'
          />
        </svg>
      </Case>
      <Default>
        <svg
          width='12'
          height='12'
          viewBox='0 0 10 10'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M4.61036 0.45343C4.72454 0.373462 4.86057 0.330566 4.99997 0.330566C5.13937 0.330566 5.27539 0.373462 5.38958 0.45343C5.50221 0.532314 5.58821 0.643502 5.63626 0.772251L6.55143 3.07682L6.55417 3.08394C6.55501 3.08622 6.5565 3.0882 6.55846 3.08965C6.56041 3.09109 6.56274 3.09194 6.56516 3.09208L6.56723 3.0922L9.02556 3.25054C9.66371 3.29198 9.8818 4.09081 9.41736 4.4769C9.41727 4.47697 9.41719 4.47704 9.4171 4.47711L7.53431 6.04749L7.53321 6.0484C7.52898 6.05191 7.52582 6.05653 7.5241 6.06175C7.52242 6.06683 7.52218 6.07228 7.52339 6.07748C7.52342 6.07762 7.52346 6.07776 7.52349 6.07791L8.13135 8.46768C8.27853 9.04864 7.6512 9.57184 7.10547 9.22761L7.10463 9.22709L5.00463 7.89375C5.0033 7.8929 5.00155 7.89233 4.99997 7.89233C4.99838 7.89233 4.99683 7.89278 4.9955 7.89363L4.99497 7.89396L3.04143 9.13107C3.04132 9.13113 3.04122 9.1312 3.04112 9.13126C2.44246 9.51188 1.751 8.93321 1.91443 8.29263C1.91446 8.29252 1.91441 8.29273 1.91443 8.29263L2.47645 6.07791C2.47648 6.07778 2.47651 6.07765 2.47654 6.07753C2.47776 6.07231 2.47752 6.06685 2.47584 6.06175C2.47412 6.05653 2.47096 6.05191 2.46672 6.0484L2.46563 6.04749L0.582834 4.47711C0.582745 4.47704 0.582656 4.47696 0.582566 4.47689C0.118136 4.0908 0.336052 3.29199 0.974202 3.25055L3.43477 3.09207C3.4372 3.09193 3.43953 3.09109 3.44148 3.08965C3.44343 3.0882 3.44492 3.08622 3.44577 3.08394L3.4485 3.07682L4.36367 0.772251C4.41173 0.643503 4.49773 0.532314 4.61036 0.45343ZM5.36216 7.33107C5.36223 7.33111 5.3621 7.33103 5.36216 7.33107L7.46114 8.66375C7.46122 8.6638 7.46105 8.66369 7.46114 8.66375C7.46493 8.66611 7.46743 8.66705 7.4681 8.66725C7.46898 8.66706 7.47185 8.66628 7.47582 8.66328C7.48087 8.65945 7.48409 8.65468 7.48554 8.65079C7.4862 8.64903 7.48665 8.64711 7.48678 8.64475C7.48691 8.64249 7.48684 8.6383 7.48519 8.63176C7.48519 8.63174 7.48519 8.63178 7.48519 8.63176L6.87644 6.23846C6.84486 6.1112 6.84989 5.97762 6.89093 5.85309C6.93188 5.72882 7.00705 5.61861 7.10779 5.53512C7.10799 5.53496 7.10819 5.53479 7.10839 5.53462L8.99117 3.96425C8.99507 3.96101 8.99672 3.95869 8.99742 3.95758C8.99819 3.95635 8.99886 3.95492 8.99938 3.95295C9.00056 3.94845 9.00098 3.9407 8.99821 3.93174C8.99544 3.92281 8.99134 3.91847 8.99013 3.91745C8.98973 3.91711 8.9896 3.91705 8.98946 3.917C8.98942 3.91698 8.9875 3.91615 8.98265 3.91582C8.98261 3.91582 8.98269 3.91582 8.98265 3.91582L6.52644 3.75762C6.52604 3.75759 6.52565 3.75757 6.52525 3.75755C6.39395 3.74968 6.26775 3.70385 6.16199 3.62561C6.0571 3.54803 5.97681 3.44189 5.93067 3.31993L5.01517 1.01454C5.01397 1.01153 5.01282 1.0085 5.01171 1.00546C5.01084 1.00305 5.00924 1.00097 5.00714 0.999494C5.00504 0.998022 5.00253 0.997233 4.99997 0.997233C4.9974 0.997233 4.9949 0.998023 4.9928 0.999494C4.9907 1.00097 4.9891 1.00305 4.98822 1.00546C4.98711 1.0085 4.98596 1.01153 4.98477 1.01454L4.06927 3.31993C4.02313 3.44189 3.94283 3.54803 3.83795 3.62561C3.73219 3.70385 3.60599 3.74968 3.47469 3.75755L1.0174 3.91581C1.01736 3.91582 1.01744 3.91581 1.0174 3.91581C1.01255 3.91614 1.01054 3.91697 1.01051 3.91699C1.01036 3.91705 1.01023 3.91709 1.0098 3.91745C1.00859 3.91847 1.00449 3.92281 1.00173 3.93174C0.998958 3.9407 0.999373 3.94845 1.00056 3.95295C1.00108 3.95492 1.00174 3.95635 1.00252 3.95758C1.00322 3.95869 1.00487 3.96101 1.00877 3.96425L1.00931 3.9647L2.89155 5.53462C2.89176 5.5348 2.89198 5.53498 2.8922 5.53516C2.99292 5.61865 3.06806 5.72884 3.10901 5.85309C3.15005 5.97762 3.15507 6.1112 3.12349 6.23846L3.12306 6.24017L2.56042 8.45738C2.54838 8.50451 2.56499 8.54102 2.59544 8.56417C2.61102 8.57601 2.62676 8.5811 2.6392 8.58197C2.64949 8.58269 2.66373 8.58121 2.68351 8.56863L4.63777 7.33107C4.63795 7.33095 4.63812 7.33084 4.6383 7.33073C4.74644 7.26211 4.87188 7.22566 4.99997 7.22566C5.12819 7.22566 5.25394 7.2623 5.36216 7.33107Z'
            fill='#C8DBFD'
          />
        </svg>
      </Default>
    </Switch>
  );
};

type WorkspaceModel = {
  id: number;
  name: string;
  status: number;
  bookmark: 0 | 1;
};

const WorkspaceSelector = () => {
  const { t } = useT();

  const { userSession, updateUserSession } = useUserSession();

  const [active, setActive] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const [workspaceList, setWorkspaceList] = useState<Array<WorkspaceModel>>([]);
  const [filteredList, setFilteredList] = useState<Array<WorkspaceModel>>([]);
  const { data: workspaceData, refetch } = useGetNavWorkspaceList();
  const bookmarkMutation = usePostWorkspaceBookmark();
  const deleteBookMarkMutation = useDeleteWorkspaceBookmark();
  const navigate = useNavigate();
  const params = useParams();

  const setWorkspaceData = () => {
    if (workspaceData?.status === 1 && Array.isArray(workspaceData.result)) {
      const bookmarkSorted = workspaceData.result.sort(
        (a, b) => b.bookmark - a.bookmark,
      );
      setWorkspaceList(bookmarkSorted);
    }
  };

  const handleChangeList = () => {
    setFilteredList(workspaceList);
  };
  const onClickSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setActive(!active);
  };

  const onClickBookMark = async (
    e: React.MouseEvent<HTMLDivElement>,
    workspaceId: number,
    status: number,
  ) => {
    e.stopPropagation();
    // delete , post 여부 판단.
    if (status) {
      const fIdx = workspaceList.findIndex((v) => v.id === workspaceId);
      if (fIdx !== -1) {
        const bookmarked = workspaceList[fIdx].bookmark;
        if (bookmarked === 0) {
          const data = { workspaceId };
          const resp = await bookmarkMutation.mutateAsync(data);
          if (resp.status === 1) {
            refetch();
          }
        } else {
          const data = { workspaceId };
          const resp = await deleteBookMarkMutation.mutateAsync(data);
          if (resp.status === 1) {
            refetch();
          }
        }
      }
    }
  };

  const onClickListItem = (
    e: React.MouseEvent<HTMLDivElement>,
    workspace: WorkspaceModel,
  ) => {
    if (workspace.status) {
      e.stopPropagation();

      updateUserSession(
        {
          ...userSession,
          workspaceId: workspace.id,
          workspaceName: workspace.name,
        },
        {},
      );

      setActive(false);

      // projects 페이지일 경우 튕겨 내보내는 로직
      if (params.pid) navigate(ADMIN_URL.PROJECTS_PAGE);
    }
  };

  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearch = () => {
    if (search) {
      const filtered = workspaceList.filter((v) => v.name.includes(search));
      setFilteredList(filtered);
    } else {
      setFilteredList(workspaceList);
    }
  };
  const handleAway = () => {
    setActive(false);
  };

  useEffect(() => {
    setWorkspaceData();
  }, [workspaceData]);

  useEffect(() => {
    handleSearch();
  }, [search]);

  useEffect(() => {
    handleChangeList();
  }, [workspaceList]);

  return (
    <ClickAwayListener onClickAway={handleAway}>
      <div className={cx('ws-selector-container')}>
        <div
          onClick={onClickSelect}
          className={cx('select-box', active && 'active')}
        >
          <div className={cx('title')}>
            <Typo type='P1' weight='medium'>
              {userSession.workspaceName}
            </Typo>
          </div>
          <div className={cx('arrow-box')}>
            <img
              className={cx('workspace-down-arrow')}
              src={CarrotSkyBlueIcon}
              alt='arrow'
            />
          </div>
        </div>
        <div className={cx('content-box', active && 'active')}>
          <div className={cx('search-box')}>
            <InputText
              value={search}
              placeholder={`${t(`component.inputBox.search`)}`}
              disableRightIcon={false}
              customStyle={{ border: 'none', fontSize: '14px', color: MONO204 }}
              rightIcon={SearchIcon}
              rightIconStyle={{
                width: '14px',
                height: '14px',
              }}
              onChange={onChangeSearch}
            />
          </div>
          <div className={cx('list-item-container')}>
            {filteredList.map((v, idx) => (
              <div
                className={cx(
                  'list-item',
                  userSession.workspaceId === v.id && 'selected',
                  v.status === 0 && 'expired',
                )}
                key={`workspace-list-item ${idx}`}
                onClick={(e) => onClickListItem(e, v)}
              >
                <div className={cx('left-side')}>
                  <Typo type='P1' weight='medium'>
                    {v.name}
                  </Typo>
                </div>
                <div className={cx('right-side')}>
                  <div className={cx('badge', v.status === 0 && 'expired')}>
                    <Typo type='P2' weight='medium'>
                      {v.status === 0
                        ? `${t(`component.badge.expired`)}`
                        : `${t(`component.badge.active`)}`}
                    </Typo>
                  </div>
                  <div
                    className={cx('star')}
                    onClick={(e) => onClickBookMark(e, v.id, v.status)}
                  >
                    <StartIcon bookmark={v.bookmark} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ClickAwayListener>
  );
};

export default WorkspaceSelector;
