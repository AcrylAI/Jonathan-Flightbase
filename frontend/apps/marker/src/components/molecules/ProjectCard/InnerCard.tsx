import React, { useEffect } from 'react';
import { useState } from 'react';
import { isMobile } from 'react-device-detect';

import { Button } from '@jonathan/ui-react';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { CardBox, Mypo, Sypo } from '@src/components/atoms';
import { toast } from '../Toast';

import useUserSession from '@src/hooks/auth/useUserSession';
import useTransfer from '@src/hooks/Common/useTransfer';
import useT from '@src/hooks/Locale/useT';

import { InnerCardItem } from './ProjectCard';

import style from './ProjectCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const InnerCard = ({
  projectData,
  innerData,
  idx,
  onInnerTabClick,
  selectInnerContent,
}: InnerCardItem) => {
  const { t } = useT();
  const {
    userSession: { isAdmin },
  } = useUserSession();

  const { moveToLabeling, moveToReview } = useTransfer();
  const [progress, setProgress] = useState<number>(0);
  const workingStatus = projectData.working !== 0;
  const noReviewProject = projectData.workflow === 0;

  const parseStringToDataType = () => {
    switch ((projectData.type).toLowerCase()) {
      case 'image': return 0;
      case 'text': return 1;
      default: return 0;
    }
  }

  // 모바일 환경이 아니라면 작업창으로 이동,
  // 모바일 환경이라면 토스트 출력
  const onClickGotoLabeling = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (!isMobile) {
      e.stopPropagation();
      const pid = projectData.id;
      await moveToLabeling(pid, parseStringToDataType());
    } else toast.error(t(`toast.common.unableToWork`));
  };

  const onClickGotoReview = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (!isMobile) {
      e.stopPropagation();
      const pid = projectData.id;
      await moveToReview(pid, parseStringToDataType());
    } else toast.error(t(`toast.common.unableToWork`));
  };

  // 진행률을 계산하여 출력하는 함수
  const calcProgress = () => {
    if (innerData.projectInfo !== undefined) {
      const data = innerData.projectInfo;

      const a: number = data.complete;
      const b: number = data.assigned;
      let progressValue: number = 0;
      if (b !== 0) {
        progressValue = Math.round((a / b) * 100);
        if (progressValue > 100) {
          progressValue = 100;
        }
      }
      setProgress(progressValue);
    }
  };

  // 그래프 transition 효과를 위한 setTimeout 함수
  useEffect(() => {
    const ticker = setTimeout(() => {
      calcProgress();
    }, 100);
    return () => {
      clearTimeout(ticker);
    };
  }, [innerData]);

  // projectCard 를 클릭했을 때만 이동 시키기 위해
  // innerCard 클릭 시에는 이동을 방지하는 함수
  const onInnerCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <CardBox
      height='fit-content'
      borderRadius={4}
      backgroundColor='#F9FAFB'
      alignItems='space-between'
      cursor='default'
      onClick={(e) => {
        onInnerCardClick(e);
      }}
    >
      <div className={cx('card-inner-tab')}>
        {isAdmin && (
          <p
            className={cx(
              'inner-box-title',
              'left-tab',
              selectInnerContent[idx] === 'project' && 'select-inner-menu',
            )}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              onInnerTabClick(idx, 'project');
            }}
          >
            <Sypo type='P2'>{t(`page.projectList.project `)}</Sypo>
          </p>
        )}
        <p
          className={cx(
            'inner-box-title',
            selectInnerContent[idx] === 'work' && 'select-inner-menu',
          )}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            onInnerTabClick(idx, 'work');
          }}
        >
          <Sypo type='P2'>
            {isAdmin === true
              ? t(`page.projectList.workToDo`)
              : t(`component.lnb.myWork`)}
          </Sypo>
          {innerData.workInfo.reddot === 1 && (
            <span className={cx('red-dot')}></span>
          )}
        </p>
        {projectData.description.length > 0 ? (
          <p
            className={cx(
              'inner-box-title',
              'right-tab',
              selectInnerContent[idx] === 'description' && 'select-inner-menu',
            )}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              onInnerTabClick(idx, 'description');
            }}
          >
            <Sypo type='P2'>{t(`page.projectList.description`)}</Sypo>
          </p>
        ) : (
          <p className={cx('inner-box-inner-line', 'right-tab')}></p>
        )}
      </div>
      <div className={cx('inner-box-content-container')}>
        <div
          className={cx(
            'inner-box-content',
            selectInnerContent[idx] === 'description' && 'description',
          )}
        >
          <Switch>
            <Case condition={selectInnerContent[idx] === 'description'}>
              <Mypo type='P1'>{projectData.description}</Mypo>
            </Case>
            <Default>
              <div className={cx('inner-box-content-list-wrapper')}>
                <Switch>
                  <Case
                    condition={!isAdmin || selectInnerContent[idx] === 'work'}
                  >
                    <>
                      <div className={cx('inner-box-content-list')}>
                        <p className={cx('inner-box-info-title')}>
                          <Sypo type='P1' weight={400}>
                            {t(`page.projectList.labeling`)}
                          </Sypo>
                        </p>
                        <p className={cx('inner-box-info-content')}>
                          <Sypo type='H4'>
                            {innerData?.workInfo.labeling.toLocaleString()}
                          </Sypo>
                        </p>
                      </div>
                      <div
                        className={cx(
                          'inner-box-content-list',
                          noReviewProject && 'no-review-project',
                        )}
                      >
                        <p className={cx('inner-box-info-title')}>
                          <Sypo type='P1' weight={400}>
                            {t(`page.projectList.review`)}
                          </Sypo>
                        </p>
                        <p className={cx('inner-box-info-content')}>
                          <Sypo type='H4'>
                            {innerData?.workInfo.review.toLocaleString()}
                          </Sypo>
                        </p>
                      </div>
                      <div
                        className={cx(
                          'inner-box-content-list',
                          noReviewProject && 'no-review-project',
                        )}
                      >
                        <p className={cx('inner-box-info-title')}>
                          <Sypo type='P1' weight={400}>
                            {t(`page.projectList.rejected`)}
                          </Sypo>
                        </p>
                        <p className={cx('inner-box-info-content')}>
                          <Sypo type='H4'>
                            {innerData?.workInfo.rejected.toLocaleString()}
                          </Sypo>
                        </p>
                      </div>
                    </>
                  </Case>
                  <Case
                    condition={
                      isAdmin === true && selectInnerContent[idx] === 'project'
                    }
                  >
                    <>
                      <div className={cx('inner-box-content-list')}>
                        <p className={cx('inner-box-info-title')}>
                          <Sypo type='P1' weight={400}>
                            {t(`page.projectList.notAssigned`)}
                          </Sypo>
                        </p>
                        <p className={cx('inner-box-info-content')}>
                          <Sypo type='H4'>
                            {innerData?.projectInfo?.notAssigned.toLocaleString()}
                          </Sypo>
                        </p>
                      </div>
                      <div className={cx('inner-box-content-list')}>
                        <p className={cx('inner-box-info-title')}>
                          <Sypo type='P1' weight={400}>
                            {t(`page.projectList.assigned`)}
                          </Sypo>
                        </p>
                        <p className={cx('inner-box-info-content')}>
                          <Sypo type='H4'>
                            {innerData?.projectInfo?.assigned.toLocaleString()}
                          </Sypo>
                        </p>
                      </div>
                      <div className={cx('inner-box-content-list')}>
                        <p className={cx('inner-box-info-title')}>
                          <Sypo type='P1' weight={400}>
                            {t(`page.projectList.completed`)}
                          </Sypo>
                        </p>
                        <p className={cx('inner-box-info-content')}>
                          <Sypo type='H4'>
                            {innerData?.projectInfo?.complete.toLocaleString()}
                          </Sypo>
                        </p>
                      </div>
                    </>
                  </Case>
                </Switch>
              </div>
              <Switch>
                <Case
                  condition={
                    isAdmin === false || selectInnerContent[idx] === 'work'
                  }
                >
                  <div
                    className={cx(
                      'labeler-card-button-wrapper',
                      noReviewProject && 'no-review-project',
                    )}
                  >
                    <div
                      className={cx(
                        'left-section',
                        noReviewProject && 'no-review-project',
                      )}
                    >
                      <Button
                        disabled={!workingStatus && true}
                        size='medium'
                        type='primary'
                        theme='jp'
                        customStyle={{
                          width: '100%',
                          height: isAdmin === false ? '36px' : '32px',
                          color: !workingStatus ? '#C1C1C1' : '',
                        }}
                        onClick={onClickGotoLabeling}
                      >
                        <Sypo type='P2' weight={400}>
                          {t(`component.btn.labeling`)}
                        </Sypo>
                      </Button>
                    </div>
                    {!noReviewProject && (
                      <div className={cx('right-section')}>
                        <Button
                          disabled={!workingStatus && true}
                          size='medium'
                          type='primary-reverse'
                          theme='jp'
                          customStyle={{
                            width: '100%',
                            height: isAdmin === false ? '36px' : '32px',
                            color: !workingStatus ? '#C1C1C1' : '',
                          }}
                          onClick={onClickGotoReview}
                        >
                          <Sypo type='P2' weight={400}>
                            {t(`component.btn.review`)}
                          </Sypo>
                        </Button>
                      </div>
                    )}
                  </div>
                </Case>
                <Case
                  condition={
                    isAdmin === true && selectInnerContent[idx] === 'project'
                  }
                >
                  <div className={cx('inner-box-graph-wrapper')}>
                    <div className={cx('inner-box-graph-text')}>
                      <Sypo type='P2'>{t(`page.projectList.progress`)}</Sypo>
                      <p
                        className={cx(
                          'inner-box-graph-text-percent',
                          !workingStatus && 'not-working-graph',
                        )}
                      >
                        <Sypo type='P2'>{progress}%</Sypo>
                      </p>
                    </div>
                    <div
                      className={cx(
                        'inner-box-graph-total',
                        !workingStatus && 'not-working-graph',
                      )}
                    >
                      <div
                        className={cx(
                          'inner-box-graph-percent',
                          !workingStatus && 'not-working-graph',
                        )}
                        style={{
                          width: `${progress}%`,
                          transition: 'width 0.4s linear',
                        }}
                      ></div>
                    </div>
                  </div>
                </Case>
              </Switch>
            </Default>
          </Switch>
        </div>
      </div>
    </CardBox>
  );
};

export default InnerCard;
