import React, { useRef } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { ProjectDashboardPageAtom } from '@src/stores/components/pageContents/ProjectDashboardPageAtom';

import { Card, Sypo } from '@src/components/atoms';

import { PageHeader } from '@src/components/molecules';

import SideView from '@src/components/organisms/SideView/SideView';

import { MONO204 } from '@src/utils/color';
import { ADMIN_URL, urlInjector } from '@src/utils/pageUrls';

import useUserSession from '@src/hooks/auth/useUserSession';
import useGetIsProjectOwner from '@src/hooks/Common/useGetIsProjectOwner/useGetIsProjectOwner';
import useT from '@src/hooks/Locale/useT';

import ClassesCard from './ClassesCard/ClassesCard';
import DatasetCard from './DatasetCard/DatasetCard';
import DataStatusCard from './DataStatusCard/DataStatusCard';
import LabelingResultCard from './LabelingResultCard/LabelingResultCard';
import ProjectMemberCard from './ProjectMemberCard/ProjectMemberCard';
import SettingWidget from './SettingWidget/SettingWidget';
import WorkStatusCard from './WorkStatusCard/WorkStatusCard';

import { GearSix } from '@src/static/images';
import { enterIcon } from '@src/static/images';
import clockIcon from '@src/static/images/icon/clock.svg';

import style from './ProjectDashboardContents.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

function ProjectDashboardContents() {
  const workResultGraphRef = useRef<HTMLDivElement | null>(null);
  const nav = useNavigate();
  const {
    userSession: { isAdmin },
  } = useUserSession();

  const params = useParams();
  const projectDashboardAtom =
    useRecoilValue<ProjectDashboardPageAtom.ProjectDashboardPageAtomModel>(
      ProjectDashboardPageAtom.projectDashboardPageAtom,
    );

  const { t } = useT();
  const isOwner = useGetIsProjectOwner({ projectId: Number(params.pid) });
  const [widgetChecked, setWidgetChecked] = useState<boolean>(false);
  const [widgetOpen, setWidgetOpen] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChangeWidgetSwitch = () => {
    const value = localStorage.getItem('setting-widget');
    const result = value === 'active' ? 'inactive' : 'active';
    localStorage.setItem('setting-widget', result);
    setWidgetChecked(result === 'active');
  };

  const initialize = () => {
    // widgetCheck
    const checked = localStorage.getItem('setting-widget');
    if (!checked || checked === 'active') {
      setWidgetChecked(true);
      const timer = setTimeout(() => {
        setWidgetOpen(true);
      }, 1000);
      timerRef.current = timer;
    }
  };

  const onClickCard = (card: 0 | 1 | 2 | 3 | 4) => {
    const { pid } = params;
    const option = {
      pid: pid ?? '',
    };
    if (pid) {
      let url = '';
      if (card === 0) {
        // data 페이지
        url = urlInjector(ADMIN_URL.DATA_PAGE, option);
      } else if (card === 1) {
        // members 페이지
        url = urlInjector(ADMIN_URL.PROJECT_MEMBERS_PAGE, option);
      } else if (card === 2) {
        // dataset 페이지
        url = urlInjector(ADMIN_URL.PROJECT_INFO_PAGE, option);
      } else if (card === 3) {
        // class 페이지
        url = urlInjector(ADMIN_URL.CLASSES_PAGE, option);
      } else if (card === 4) {
        // labeling 페이지
        url = urlInjector(ADMIN_URL.AUTOLABELING_RUN_PAGE, option);
      }
      nav(url);
    }
  };

  useEffect(() => {
    initialize();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={cx('project-dashboard')}>
      <PageHeader
        pageTitle={t('page.dashboardProject.header')}
        projectTitle
        projectTitleValue={projectDashboardAtom.projectMetaData.name}
      />
      <SideView
        size='md'
        title={`${t(`component.settingWidget.widget`)}`}
        toggleIcon={GearSix}
        opened={widgetOpen}
        disabled={!isOwner}
        checked={widgetChecked}
        onChangeChecked={onChangeWidgetSwitch}
      >
        <SettingWidget />
      </SideView>
      <div className={cx('last-sync')}>
        <img src={clockIcon} alt='clock' />
        <Sypo type='P2' color={MONO204}>
          {t(`page.dashboardProject.lastSync`)} :{' '}
          {projectDashboardAtom.pageData.updatedDate}
        </Sypo>
      </div>
      <div className={cx('contents-area')}>
        <div className={cx('status-card')}>
          <Card
            customStyle={{
              width: '100%',
              height: '436px',
              overflowX: 'scroll',
              overflowY: 'hidden',
            }}
          >
            <WorkStatusCard />
          </Card>
        </div>
        <div className={cx('datastatus-projectmember-dataset')}>
          <Card
            customStyle={{
              width: '100%',
            }}
            enterIcon={enterIcon}
            hoverable
            onClickCard={
              isAdmin
                ? () => {
                    onClickCard(0);
                  }
                : undefined
            }
          >
            <DataStatusCard />
          </Card>
          <div className={cx('projectmember-dataset')}>
            <Card
              customStyle={{
                width: '100%',
                padding: '24px',
              }}
              enterIcon={enterIcon}
              hoverable
              onClickCard={
                isAdmin
                  ? () => {
                      onClickCard(1);
                    }
                  : undefined
              }
            >
              <ProjectMemberCard />
            </Card>
            <Card
              customStyle={{
                width: '100%',
                height: '100%',
              }}
              enterIcon={enterIcon}
              hoverable
              onClickCard={
                isAdmin
                  ? () => {
                      onClickCard(2);
                    }
                  : undefined
              }
            >
              <DatasetCard />
            </Card>
          </div>
        </div>
        <div className={cx('classes-workresult')}>
          <Card
            customStyle={{
              width: '100%',
              height: '404px',
            }}
            hoverable
            enterIcon={enterIcon}
            onClickCard={
              isAdmin
                ? () => {
                    onClickCard(3);
                  }
                : undefined
            }
          >
            <ClassesCard />
          </Card>
          <Card
            customStyle={{
              width: '100%',
              height: '404px',
            }}
            hoverable
            enterIcon={enterIcon}
            onClickCard={
              isAdmin
                ? (e: React.MouseEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    const workResultGraph = workResultGraphRef.current;
                    if (
                      workResultGraph &&
                      !workResultGraph.contains(e.target as Node)
                    ) {
                      onClickCard(4);
                    }
                  }
                : undefined
            }
          >
            <LabelingResultCard ref={workResultGraphRef} />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProjectDashboardContents;
