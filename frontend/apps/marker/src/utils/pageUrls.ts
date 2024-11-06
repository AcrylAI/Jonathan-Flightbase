type UrlTypes = {
  readonly [key: string]: string;
};

const NONE_URL: UrlTypes = {
  ROOT_PAGE: '/',
  LOGIN_PAGE: '/login',
  JF_AUTH_PAGE: '/auth',
};

const ADMIN_URL: UrlTypes = {
  PROJECTS_PAGE: '/admin/projects',
  PROJECTS_DASHBOARD_PAGE: '/admin/projects/:pid/dashboard/project',
  MYWORK_DASHBOARD_PAGE: '/admin/projects/:pid/dashboard/mywork',
  DATA_PAGE: '/admin/projects/:pid/data',
  AUTOLABELING_RUN_PAGE: '/admin/projects/:pid/auto-labeling/run',
  AUTOLABELING_SET_PAGE: '/admin/projects/:pid/auto-labeling/set',
  CLASSES_PAGE: '/admin/projects/:pid/classes',
  EXPORT_RESULTS_PAGE: '/admin/projects/:pid/export-results',
  PROJECT_MEMBERS_PAGE: '/admin/projects/:pid/project-members',
  PROJECT_INFO_PAGE: '/admin/projects/:pid/project-info',
  MEMBERS_PAGE: '/admin/members',
  MODELS_PAGE: '/admin/models',
};

const USER_URL: UrlTypes = {
  PROJECT_PAGE: '/user/projects',
  MYWORK_DASHBOARD_PAGE: '/user/projects/:pid/dashboard/mywork',
};

const COMMON_URL: UrlTypes = {
  ERROR_403: '/common/403',
  TOKEN_ERROR_PAGE: '/common/token-error',
  ANNOTATION_PAGE: '/common/annotation/:jid',

  LABELING_IMAGE_PAGE: '/common/labeling/image/:jid',
  INSPECTION_IMAGE_PAGE: '/common/inspection/image/:jid',
  VIEW_IMAGE_PAGE: '/common/view/image/:jid',

  LABELING_TEXT_PAGE: '/common/labeling/text/:jid',
  INSPECTION_TEXT_PAGE: '/common/inspection/text/:jid',
  VIEW_TEXT_PAGE: '/common/view/text/:jid',
};

const urlInjector = (url: string, params: { [key: string]: string }) => {
  let injectedUrl = url;
  Object.keys(params).forEach((param: string) => {
    injectedUrl = injectedUrl.replace(`:${param}`, params[param]);
  });
  return injectedUrl;
};

export { NONE_URL, ADMIN_URL, USER_URL, COMMON_URL, urlInjector };
