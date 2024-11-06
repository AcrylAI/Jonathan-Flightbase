import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import _, { debounce } from 'lodash';

import { InputText } from '@jonathan/ui-react';

import { Case, Default, Switch } from '@jonathan/react-utils';

import {
  ProjectsContentsAtom,
  ProjectsContentsAtomModel,
} from '@src/stores/components/pageContents/ProjectsContentsAtom/ProjectsContentsAtom';

import useGetProjectList from '@src/pages/ProjectsPage/hooks/useGetProjectList';

import { PageHeader } from '@src/components/molecules';

import { ProjectInfoTypes, ProjectsCardList } from '@src/components/organisms';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

import FilterButton from './FilterButton';
import NoProject from './NoProject';

import style from './ProjectsPage.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const ProjectsPage = () => {
  const { t } = useT();
  const {
    userSession: { workspaceId, isAdmin },
  } = useUserSession();

  const [selectInnerContent, setSelectInnerContent] = useState<
    Array<'project' | 'work' | 'description'>
  >([]);
  const [projectList, setProjectList] = useState<Array<ProjectInfoTypes>>([]);
  const [pageState, setPageState] =
    useRecoilState<ProjectsContentsAtomModel>(ProjectsContentsAtom);

  const response = useGetProjectList({
    workspaceId,
    filter1: pageState.filter1,
    filter2: pageState.filter2,
    search: pageState.search,
  });
  const { data, refetch, isLoading } = response;
  const reset = useResetRecoilState(ProjectsContentsAtom);
  const isGetFirstData = useRef<boolean>(false);

  // 초대 받은 프로젝트가 없다면 true, 아니라면 false 를 반환하는 함수 (for labeler)
  const notEmpty = useRef<boolean>(
    (() => {
      if (data && Array.isArray(data.result) && data.result.length > 0) {
        return true;
      }
      return false;
    })(),
  );

  // data 가 바뀔 때마다 북마크 된 프로젝트부터 sorting 하고
  // projectCard 에서 선택된 탭이 무엇인지 배열을 만들어주는 함수
  useEffect(() => {
    if (data && Array.isArray(data.result)) {
      const result = data.result as Array<ProjectInfoTypes>;
      const newArr: Array<'project' | 'work' | 'description'> = Array.from(
        { length: result.length },
        () => (isAdmin ? 'project' : 'work'),
      );
      const bookmarked = data.result.filter(({ bookmark }) => bookmark === 1);
      const notBookmarked = data.result.filter(
        ({ bookmark }) => bookmark === 0,
      );
      setProjectList([...bookmarked, ...notBookmarked]);
      setSelectInnerContent(Array.from(newArr));
    }
  }, [data]);

  // notEmpty 가 false 여도, 처음 불러온 데이터가 아니라면
  // 필터링된 경우이므로 초대 받은 프로젝트 없음 컴포넌트 출력 방지를 위해
  // notEmpty 를 true 로 바꿉니다.
  useEffect(() => {
    if (
      data &&
      !isGetFirstData.current &&
      Array.isArray(data.result) &&
      data.result.length > 0
    ) {
      notEmpty.current = true;
      isGetFirstData.current = true;
    }
  }, [data]);

  // 카드별로 선택된 innerTab 을 바꿔주는 onClick 함수
  const onInnerTabClick = (
    idx: number,
    selected: 'project' | 'work' | 'description',
  ) => {
    setSelectInnerContent((data) => {
      const cardTab = [...data];
      cardTab[idx] = selected;

      return cardTab;
    });
  };

  const handleRefetch = () => {
    refetch();
  };

  // 검색된 단어를 업데이트 하는 onChange 함수
  const onChangeSearch = (e?: React.ChangeEvent<HTMLInputElement>) => {
    const temp = _.cloneDeep(pageState);
    if (e) {
      temp.search = e.target.value;
    } else {
      temp.search = '';
    }
    setPageState(temp);
  };

  // 2.5초 마다 자동으로 search 값을 넘겨서 refetch 시키는 함수
  const searchRefetch = debounce(() => {
    refetch();
  }, 250);

  useEffect(() => {
    searchRefetch();
  }, [pageState.search]);

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    refetch();
  }, []);

  return (
    <>
      <PageHeader
        leftSection='spinner'
        loading={isLoading}
        pageTitle={t(`component.lnb.projects`)}
      />
      <div className={cx('filter-search-wrapper')}>
        <FilterButton />
        <InputText
          status='default'
          size='meduium'
          theme='jp-primary'
          autoFocus
          placeholder={t(`component.inputBox.search`)}
          disableLeftIcon={false}
          disableClearBtn={!pageState.search}
          customStyle={{
            width: '220px',
            height: '36px',
            fontFamily: 'SpoqaR',
            fontSize: '14px',
            lineHeight: '14px',
          }}
          onChange={onChangeSearch}
          value={pageState.search ?? ''}
          onClear={() => {
            if (onChangeSearch) {
              onChangeSearch();
            }
          }}
        ></InputText>
      </div>
      <Switch>
        <Case condition={data?.result.length === 0 && !isAdmin}>
          {notEmpty.current ? <></> : <NoProject />}
        </Case>
        <Default>
          <ProjectsCardList
            projectData={projectList}
            refetch={handleRefetch}
            onInnerTabClick={onInnerTabClick}
            selectInnerContent={selectInnerContent}
            isLoading={isLoading}
          />
        </Default>
      </Switch>
    </>
  );
};

export default ProjectsPage;
