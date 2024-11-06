import { forwardRef } from 'react';
import { useRecoilState } from 'recoil';

import { templateStore } from '@src/stores/globalStore';

import { Sypo } from '@src/components/atoms';

import { ADMIN_URL } from '@src/utils/pageUrls';

import useCasingNer from '@src/hooks/Common/useCasingNer';
import useT from '@src/hooks/Locale/useT';

import WorkspaceSelector from './WorkspaceSelector/WorkspaceSelector';
import SideMenuItem from './SideMenuItem';

import {
  AutolabelerIcon,
  ClassesIcon,
  DataIcon,
  EqualizerIcon,
  ExportIcon,
  ManualDownloadIcon,
  ModelIcon,
  ParticiIcon,
  ProjectIcon,
  ProjectInfo,
  ProjectMember,
} from '@src/static/images';

import style from './SideNavBar.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

export type MenuListItem = {
  title: string;
  icon: string;
  path: Array<string>;
  key: string;
};

type SubMenuItem = {
  title: string;
  icon: string;
  path: Array<string>;
  key: string;
  clickEventType: 'navigate' | 'openMenu';
};

export type SubMenuListModel = {
  list: Array<SubMenuItem>;
};

const SideNavBar = forwardRef<HTMLDivElement>((_, sideNavRef) => {
  const { t } = useT();
  const [isSideOpen] = useRecoilState<boolean>(templateStore);
  const { type } = useCasingNer();

  const sideMenuList: Array<MenuListItem> = [
    {
      title: t(`component.lnb.projects`),
      icon: ProjectIcon,
      path: [ADMIN_URL.PROJECTS_PAGE],
      key: 'projects',
    },
    {
      title: t(`component.lnb.members`),
      icon: ParticiIcon,
      path: [ADMIN_URL.MEMBERS_PAGE],
      key: 'members',
    },
    {
      title: t(`component.lnb.models`),
      icon: ModelIcon,
      path: [ADMIN_URL.MODELS_PAGE],
      key: 'models',
    },
  ];

  const subMenuList: Array<SubMenuListModel> = [
    {
      list: [
        {
          title: t(`component.lnb.dashboard`),
          icon: EqualizerIcon,
          path: [
            ADMIN_URL.PROJECTS_DASHBOARD_PAGE,
            ADMIN_URL.MYWORK_DASHBOARD_PAGE,
          ],
          key: 'dashboard',
          clickEventType: 'openMenu',
        },
        {
          title: t(`component.lnb.data`),
          icon: DataIcon,
          path: [ADMIN_URL.DATA_PAGE],
          key: 'data',
          clickEventType: 'navigate',
        },
        {
          title: t(`component.lnb.autolabeling`),
          icon: AutolabelerIcon,
          path: [
            ADMIN_URL.AUTOLABELING_RUN_PAGE,
            ADMIN_URL.AUTOLABELING_SET_PAGE,
          ],
          key: 'auto-labeling',
          clickEventType: 'openMenu',
        },
        {
          title: t(`component.lnb.tools`),
          icon: ClassesIcon,
          path: [ADMIN_URL.CLASSES_PAGE],
          key: 'classes',
          clickEventType: 'navigate',
        },
        {
          title: t(`component.lnb.exportResults`),
          icon: ExportIcon,
          path: [ADMIN_URL.EXPORT_RESULTS_PAGE],
          key: 'export-results',
          clickEventType: 'navigate',
        },
        {
          title: t(`component.lnb.projectMembers`),
          icon: ProjectMember,
          path: [ADMIN_URL.PROJECT_MEMBERS_PAGE],
          key: 'project-members',
          clickEventType: 'navigate',
        },
        {
          title: t(`component.lnb.projectInfo`),
          icon: ProjectInfo,
          path: [ADMIN_URL.PROJECT_INFO_PAGE],
          key: 'project-info',
          clickEventType: 'navigate',
        },
      ],
    },
  ];
  const subMenuListByNer: Array<SubMenuListModel> = [
    {
      list: [
        {
          title: t(`component.lnb.dashboard`),
          icon: EqualizerIcon,
          path: [
            ADMIN_URL.PROJECTS_DASHBOARD_PAGE,
            ADMIN_URL.MYWORK_DASHBOARD_PAGE,
          ],
          key: 'dashboard',
          clickEventType: 'openMenu',
        },
        {
          title: t(`component.lnb.data`),
          icon: DataIcon,
          path: [ADMIN_URL.DATA_PAGE],
          key: 'data',
          clickEventType: 'navigate',
        },
        {
          title: t(`component.lnb.tools`),
          icon: ClassesIcon,
          path: [ADMIN_URL.CLASSES_PAGE],
          key: 'classes',
          clickEventType: 'navigate',
        },
        {
          title: t(`component.lnb.exportResults`),
          icon: ExportIcon,
          path: [ADMIN_URL.EXPORT_RESULTS_PAGE],
          key: 'export-results',
          clickEventType: 'navigate',
        },
        {
          title: t(`component.lnb.projectMembers`),
          icon: ProjectMember,
          path: [ADMIN_URL.PROJECT_MEMBERS_PAGE],
          key: 'project-members',
          clickEventType: 'navigate',
        },
        {
          title: t(`component.lnb.projectInfo`),
          icon: ProjectInfo,
          path: [ADMIN_URL.PROJECT_INFO_PAGE],
          key: 'project-info',
          clickEventType: 'navigate',
        },
      ],
    },
  ];

  // 서비스 매뉴얼 다운로드
  const onDownloadServiceManual = () => {
    const link = document.createElement('a');
    link.href = '/manual/Marker2.0_Guide.pdf'; // 서버에 파일이름은 항상 동일하게 올리고
    link.download = 'Marker2.0_Guide_230419.pdf'; // 다운로드 받을 때 업데이트 날짜 들어가게 하기
    link.target = '_blank';
    link.click();
    link.remove();
  };

  return (
    <div
      className={cx(
        'side-nav-container',
        isSideOpen ? 'open-side-nav' : 'close-side-nav',
      )}
      ref={sideNavRef}
    >
      <WorkspaceSelector />
      <div className={cx('side-nav-menu-wrapper')}>
        <div className={cx('side-nav-menu')}>
          <SideMenuItem
            list={sideMenuList}
            subList={type !== 1 ? subMenuList : subMenuListByNer}
          />
        </div>
        <div className={cx('manual-container')}>
          <button
            className={cx('manual-download-button')}
            onClick={() => onDownloadServiceManual()}
          >
            <Sypo type='P2' weight={400}>
              Service Manual
            </Sypo>
            <img src={ManualDownloadIcon} alt='download' />
          </button>
        </div>
      </div>
    </div>
  );
});

export default SideNavBar;
