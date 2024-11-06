import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState, useResetRecoilState } from 'recoil';
import _ from 'lodash';

import {
  ClassPageContentsAtom,
  ClassPageContentsAtomModel,
} from '@src/stores/components/pageContents/ClassPageContents/ClassPageContentsAtom';

import { PageHeader } from '@src/components/molecules';
import { toast } from '@src/components/molecules/Toast';

import { useGetProjectMetaData } from '@src/components/organisms/Modal/AssignModal/hooks/useGetProjectMetaData';
import ClassEditModal from '@src/components/organisms/Modal/ClassEditModal/ClassEditModal';

import ClassPageContents from '@src/components/pageContents/ClassPageContents/ClassPageContents';
import { useGetProjectClasses } from '@src/components/pageContents/ClassPageContents/hooks/useGetProjectClasses';

import useGetIsProjectOwner from '@src/hooks/Common/useGetIsProjectOwner/useGetIsProjectOwner';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import styles from './ClassesPage.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const ClassesPage = () => {
  const { pid } = useParams();
  const { t } = useT();
  const { data: metaData } = useGetProjectMetaData({ projectId: Number(pid) });
  const {
    data: classData,
    isLoading,
    refetch,
  } = useGetProjectClasses({
    projectId: Number(pid),
  });
  const isOwner = useGetIsProjectOwner({ projectId: Number(pid) });
  const modal = useModal();
  const params = useParams();
  const [pageState, setPageState] = useRecoilState<ClassPageContentsAtomModel>(
    ClassPageContentsAtom,
  );
  const reset = useResetRecoilState(ClassPageContentsAtom);

  const handleRefetch = () => {
    refetch();
  };

  const openEditModal = () => {
    const pId = Number(params.pid);
    if (!Number.isNaN(pId)) {
      modal.createModal({
        title: '클래스 수정 모달',
        fullscreen: true,
        content: (
          <ClassEditModal
            refetch={handleRefetch}
            projectId={pId}
            classList={classData?.result?.class ?? []}
          />
        ),
      });
    } else {
      toast.error('프로젝트 메타 정보를 얻어오는데 실패하였습니다.');
    }
  };
  const setClassData = () => {
    const temp = _.cloneDeep(pageState);
    temp.classList = classData?.result?.class ?? [];

    if (temp.selected === 0) {
      temp.selected = temp.classList.length > 0 ? temp.classList[0].id : 0;
    }
    setPageState(temp);
  };
  useEffect(() => {
    setClassData();
  }, [classData]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  return (
    <div className={cx('page-container')}>
      <PageHeader
        leftSection='spinner'
        // TODO: 텍스트 타입일 때 수정 버튼은 추후 활성화 예정
        rightSection={
          pageState.classList.length > 0 &&
          isOwner &&
          metaData?.result.type !== 1 &&
          'button'
        }
        color='blue'
        onClickAction={openEditModal}
        buttonText={t(`component.btn.edit`)}
        loading={isLoading}
        projectTitle
        projectTitleValue={metaData?.result?.name ?? ''}
        pageTitle={`${t(`page.tools.pageHeader`)}`}
      ></PageHeader>
      <ClassPageContents
        isLoading={isLoading}
        openModal={openEditModal}
        classList={pageState.classList}
      />
    </div>
  );
};

export default ClassesPage;
