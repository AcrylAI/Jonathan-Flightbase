import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@jonathan/ui-react';

import useDeleteProjectBookmark from '@src/pages/ProjectsPage/hooks/useDeleteProjectBookmark';
import usePostProjectBookmark from '@src/pages/ProjectsPage/hooks/usePostProjectBookmark';

import { CardBox, Sypo } from '@src/components/atoms';
import {
  AlignDotIcon,
  BookmarkIcon,
  DeleteIcon,
} from '@src/components/atoms/Icon';
import { toast } from '../Toast';

import { InnerInfoTypes, ProjectInfoTypes } from '@src/components/organisms';
import { DeleteProjectModal } from '@src/components/organisms';

import { BLUE104, MONO204, MONO205 } from '@src/utils/color';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import DataTypeIconBox from './DataTypeIconBox';
import InnerCard from './InnerCard';

import { CrownIcon } from '@src/static/images';

import style from './ProjectCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

export type ProjectCardItem = {
  projectData: ProjectInfoTypes;
  innerData: InnerInfoTypes;
  idx: number;
  onCardClick: (projectId: number) => void;
  projectId: number;
  onInnerTabClick: (
    idx: number,
    selected: 'project' | 'work' | 'description',
  ) => void;
  selectInnerContent: Array<'project' | 'work' | 'description'>;
  refetch: () => void;
};

export type InnerCardItem = {
  projectData: ProjectInfoTypes;
  innerData: InnerInfoTypes;
  idx: number;
  onInnerTabClick: (
    idx: number,
    selected: 'project' | 'work' | 'description',
  ) => void;
  selectInnerContent: Array<'project' | 'work' | 'description'>;
};

/* eslint-disable no-unused-expressions */
const ProjectCard = ({
  projectData,
  innerData,
  idx,
  onCardClick,
  projectId,
  onInnerTabClick,
  selectInnerContent,
  refetch,
}: ProjectCardItem) => {
  const { t } = useT();
  const {
    userSession: { user: userName, isAdmin },
  } = useUserSession();

  const workingStatus = projectData.working !== 0;
  const bookmarkValue = projectData.bookmark !== 0;
  const [bookmarkStatus, setBookmarkStatus] = useState<boolean>(bookmarkValue);
  const { mutateAsync: postRequest } =
    usePostProjectBookmark(setBookmarkStatus);
  const { mutateAsync: deleteRequest } =
    useDeleteProjectBookmark(setBookmarkStatus);
  const isProjectOwner = userName === projectData.ownerName;
  const deleteBoxRef = useRef<HTMLDivElement>(null);
  const deleteButtonRef = useRef<HTMLDivElement>(null);

  const [bookmarkButtonHover, setBookmarkButtonHover] =
    useState<string>(MONO204);
  const [editButtonHover, setEditButtonHover] = useState<string>(MONO204);
  const [editButtonClick, setEditButtonClick] = useState<boolean>(false);

  const modal = useModal();

  // 북마크 버튼 클릭시 POST/DELETE 요청을 보내는 함수
  const onBookmarkClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (projectData.bookmark === 1) {
      await deleteRequest({ projectId: projectData.id });
      refetch();
    } else {
      await postRequest({ projectId: projectData.id });
      refetch();
    }
  };

  const onBookmarkOver = () => {
    bookmarkButtonHover === MONO204 && setBookmarkButtonHover(MONO205);
  };

  const onBookmarkOut = () => {
    bookmarkButtonHover === MONO205 && setBookmarkButtonHover(MONO204);
  };

  const onEditOver = () => {
    editButtonHover === MONO204 && setEditButtonHover(MONO205);
  };

  const onEditOut = () => {
    editButtonHover === MONO205 && setEditButtonHover(MONO204);
  };

  const onEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setEditButtonClick(!editButtonClick);
  };

  // projectOwner 가 아닐 시 토스트를,
  // projectOwner 가 맞다면 프로젝트 삭제 모달을 띄웁니다.
  const onDeleteClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isProjectOwner) {
      modal.createModal({
        title: t(`component.btn.delete`),
        content: (
          <DeleteProjectModal
            projectId={projectId}
            projectName={projectData.projectTitle}
            refetch={() => {
              refetch();
            }}
            setEditButtonClick={setEditButtonClick}
          />
        ),
      });
    } else toast.error(t(`toast.delete.deletePermission`));
  };

  const onDeleteOutsideClick = (e: MouseEvent) => {
    e.stopPropagation();
    const deleteArea = deleteBoxRef.current;
    const deleteButton = deleteButtonRef.current;

    if (deleteArea && deleteButton) {
      const deleteChildren = deleteArea.contains(e.target as Node);
      const deleteBtnArea = deleteButton.contains(e.target as Node);

      if (!deleteChildren && !deleteBtnArea) {
        setEditButtonClick(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', (e) => {
      onDeleteOutsideClick(e);
    });
    return () => {
      document.removeEventListener('mousedown', (e) => {
        onDeleteOutsideClick(e);
      });
    };
  });

  return (
    <CardBox
      width='100%'
      height='342px'
      padding='20px 24px'
      borderRadius={10}
      border='1px solid #C8DBFD'
      backgroundColor='#FFFFFF'
      hoverShadow='0px 3px 12px rgba(45, 118, 248, 0.16)'
      onCardClick={onCardClick}
      projectId={projectId}
    >
      <div className={cx('card-inner-wrapper', !isAdmin && 'labeler-card')}>
        <div className={cx('project-header')}>
          <div className={cx('card-header-icon-wrapper')}>
            <span>
              {/* 프로젝트가 진행 중이라면 working,
                아니라면 not-working 에 따라 color 변경 */}
              <DataTypeIconBox
                workingStatus={workingStatus}
                autolabeling={projectData.autolabeling}
                isOwner={userName === projectData.ownerName}
                dataType={projectData.type ?? ''}
              />
            </span>
            {/* 사용중인 도구 표시 map 부분
                도구가 2개 이상이라면 첫번째 도구만 표시하고 더보기 버튼 출력 */}
            <div className={cx('project-tool-wrapper')}>
              {projectData.tools?.length > 2 ? (
                <>
                  <p
                    className={cx(
                      'tool-type',
                      workingStatus ? 'working-project' : 'not-working-project',
                    )}
                  >
                    <Sypo type='P2'>{projectData.tools[0]}</Sypo>
                  </p>
                  {workingStatus ? (
                    <Button
                      size='x-small'
                      type='primary-light'
                      customStyle={{
                        fontFamily: 'spoqaB',
                        padding: '4px 12px',
                        letterSpacing: '1px',
                      }}
                    >
                      ...
                    </Button>
                  ) : (
                    <Button
                      size='x-small'
                      type='gray'
                      customStyle={{
                        fontFamily: 'spoqaB',
                        padding: '4px 12px',
                        letterSpacing: '1px',
                        backgroundColor: '#F0F0F0',
                        color: '#747474',
                        border: 'none',
                      }}
                    >
                      ...
                    </Button>
                  )}
                  {/* 2개까지는 사용 중인 도구 정보를 받아와서 map */}
                  {/* NER 작업 후 도구 더 보기 기능 추가 예정입니다 */}
                </>
              ) : (
                projectData.tools?.map((toolData, index) => (
                  <p
                    key={`tool-${index}`}
                    className={cx(
                      'tool-type',
                      workingStatus ? 'working-project' : 'not-working-project',
                    )}
                  >
                    <Sypo type='P2'>
                      {toolData === 'Bounding Box' ? 'B-box' : toolData}
                    </Sypo>
                  </p>
                ))
              )}
            </div>
          </div>
          <div className={cx('project-edit-button-wrapper')}>
            <button
              className={cx('bookmark-button')}
              onClick={onBookmarkClick}
              onMouseOver={onBookmarkOver}
              onMouseOut={onBookmarkOut}
            >
              <BookmarkIcon
                color={
                  projectData.bookmark === 1 ? BLUE104 : bookmarkButtonHover
                }
                fill={projectData.bookmark === 1 ? BLUE104 : 'none'}
              />
            </button>
            {isAdmin && (
              <div className={cx('delete-wrapper')} ref={deleteButtonRef}>
                <button
                  className={cx('edit-button')}
                  onMouseOver={onEditOver}
                  onMouseOut={onEditOut}
                  onClick={(e) => {
                    onEditClick(e);
                  }}
                >
                  <AlignDotIcon fill={editButtonHover} />
                </button>
                <div
                  className={cx(
                    'delete-drop-container',
                    editButtonClick && 'active',
                  )}
                  onClick={onDeleteClick}
                  ref={deleteBoxRef}
                >
                  <div
                    className={cx(
                      'delete-drop-inner',
                      !isProjectOwner && 'not-owner',
                    )}
                  >
                    <DeleteIcon color={MONO205} size='default' />
                    <p>
                      <Sypo type='P1'>{t(`component.radiobtn.delete`)}</Sypo>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={cx('title-desc-wrapper')}>
          {isProjectOwner && (
            <div className={cx('owner-crown')}>
              <img src={CrownIcon} alt='' />
            </div>
          )}
          <p
            className={cx('project-title', isAdmin === false && 'labeler-card')}
          >
            <Sypo type='H2'>{projectData.projectTitle}</Sypo>
          </p>
        </div>
        <InnerCard
          projectData={projectData}
          innerData={innerData}
          idx={idx}
          onInnerTabClick={onInnerTabClick}
          selectInnerContent={selectInnerContent}
        />
      </div>
    </CardBox>
  );
};

export default ProjectCard;
