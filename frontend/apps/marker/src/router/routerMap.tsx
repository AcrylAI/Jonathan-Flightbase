import { Navigate } from 'react-router-dom';

import {
  AnnotationPage,
  AutoLabelingRunPage,
  AutoLabelingSetPage,
  ClassesPage,
  DataPage,
  ExportResultsPage,
  Forbidden403,
  JFAuthPage,
  LabelImagePage,
  LabelTextPage,
  LabPage,
  LoginPage,
  MembersPage,
  ModelsPage,
  MyWorkDashboardPage,
  ProjectDashboardPage,
  ProjectInfoPage,
  ProjectMembersPage,
  ProjectsPage,
  TestPage,
  TokenErrorPage,
} from '@src/pages';
import ViewTextPage from '@src/pages/LabelTextPage/ViewTextPage';

import { ADMIN_URL, COMMON_URL, NONE_URL, USER_URL } from '@src/utils/pageUrls';

import type { ReactRouterMapType } from './types';
import ReviewTextPage from "@src/pages/LabelTextPage/ReviewTextPage";

const routerMap: Array<ReactRouterMapType> = [
  // 로그인
  {
    name: 'Root',
    path: NONE_URL.ROOT_PAGE,
    auth: 'common',
    page: <Navigate replace to={NONE_URL.LOGIN_PAGE} />,
  },
  {
    name: 'JFlogin',
    auth: 'common',
    path: NONE_URL.JF_AUTH_PAGE,
    page: <JFAuthPage />,
  },
  {
    name: 'Login',
    path: NONE_URL.LOGIN_PAGE,
    auth: 'common',
    page: <LoginPage />,
  },
  // 공통
  {
    name: 'Annotation',
    path: COMMON_URL.ANNOTATION_PAGE,
    auth: 'common',
    page: <AnnotationPage />,
  },
  {
    name: 'TokenError',
    path: COMMON_URL.TOKEN_ERROR_PAGE,
    auth: 'common',
    page: <TokenErrorPage />,
  },
  {
    name: 'Error403',
    path: COMMON_URL.Error403,
    auth: 'common',
    page: <Forbidden403 />,
  },

  // 변경된 디자인
  {
    name: 'LabelImage',
    path: COMMON_URL.LABELING_IMAGE_PAGE,
    auth: 'common',
    page: <LabelImagePage />,
  },
  {
    name: 'ReviewImage',
    path: COMMON_URL.INSPECTION_IMAGE_PAGE,
    auth: 'common',
    page: <LabelImagePage />,
  },
  {
    name: 'ViewImage',
    path: COMMON_URL.VIEW_IMAGE_PAGE,
    auth: 'common',
    page: <LabelImagePage />,
  },
  {
    name: 'LabelText',
    path: COMMON_URL.LABELING_TEXT_PAGE,
    auth: 'common',
    page: <LabelTextPage />,
  },
  {
    name: 'ReviewText',
    path: COMMON_URL.INSPECTION_TEXT_PAGE,
    auth: 'common',
    page: <ReviewTextPage />,
  },
  {
    name: 'ViewText',
    path: COMMON_URL.VIEW_TEXT_PAGE,
    auth: 'common',
    page: <ViewTextPage />,
  },

  // 매니저
  {
    name: 'AdminProjects',
    path: ADMIN_URL.PROJECTS_PAGE,
    auth: 'admin',
    page: <ProjectsPage />,
  },
  {
    name: 'AdminProjectsDashboard',
    path: ADMIN_URL.PROJECTS_DASHBOARD_PAGE,
    auth: 'admin',
    page: <ProjectDashboardPage />,
  },
  {
    name: 'AdminMyWokrDashboard',
    path: ADMIN_URL.MYWORK_DASHBOARD_PAGE,
    auth: 'admin',
    page: <MyWorkDashboardPage />,
  },
  {
    name: 'AdminData',
    path: ADMIN_URL.DATA_PAGE,
    auth: 'admin',
    page: <DataPage />,
  },
  {
    name: 'AdminAutolabelingRun',
    path: ADMIN_URL.AUTOLABELING_RUN_PAGE,
    auth: 'admin',
    page: <AutoLabelingRunPage />,
  },
  {
    name: 'AdminAutolabelingSet',
    path: ADMIN_URL.AUTOLABELING_SET_PAGE,
    auth: 'admin',
    page: <AutoLabelingSetPage />,
  },
  {
    name: 'AdminClasses',
    path: ADMIN_URL.CLASSES_PAGE,
    auth: 'admin',
    page: <ClassesPage />,
  },
  {
    name: 'AdminExportResults',
    path: ADMIN_URL.EXPORT_RESULTS_PAGE,
    auth: 'admin',
    page: <ExportResultsPage />,
  },
  {
    name: 'AdminProjectMembers',
    path: ADMIN_URL.PROJECT_MEMBERS_PAGE,
    auth: 'admin',
    page: <ProjectMembersPage />,
  },
  {
    name: 'AdminProjectInfo',
    path: ADMIN_URL.PROJECT_INFO_PAGE,
    auth: 'admin',
    page: <ProjectInfoPage />,
  },
  {
    name: 'AdminMembers',
    path: ADMIN_URL.MEMBERS_PAGE,
    auth: 'admin',
    page: <MembersPage />,
  },
  {
    name: 'AdminModels',
    path: ADMIN_URL.MODELS_PAGE,
    auth: 'admin',
    page: <ModelsPage />,
  },

  // 라벨러
  {
    name: 'UserProject',
    path: USER_URL.PROJECT_PAGE,
    auth: 'user',
    page: <ProjectsPage />,
  },
  {
    name: 'UserMyWorkDashboard',
    path: USER_URL.MYWORK_DASHBOARD_PAGE,
    auth: 'user',
    page: <MyWorkDashboardPage />,
  },
  {
    name: 'Lab',
    path: '/lab',
    auth: 'admin',
    page: <LabPage />,
  },
  {
    name: 'SVGTest',
    path: '/test/svg',
    auth: 'common',
    page: <TestPage />,
  },
];

export { routerMap };
