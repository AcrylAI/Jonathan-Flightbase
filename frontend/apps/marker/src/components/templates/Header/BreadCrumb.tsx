import { useNavigate } from 'react-router-dom';

import { Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import style from './Header.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

import useGetProjectMetaData from '@src/hooks/Api/useGetProjectMetaData';

const BreadCrumb = () => {
  const navigate = useNavigate();
  const { t } = useT();
  let projectId: string | number = 0;
  const workspaceName = window.sessionStorage.getItem('workspace_name');

  const currentPath = window.location.pathname;
  const pathArray = currentPath.split('/');
  // 다국화 기능을 위한 배열
  const pageNameArray = {
    projects: `${t(`component.lnb.projects`)}`,
    project: `${t(`page.dashboardProject.header`)}`,
    mywork: `${t(`page.dashboardMyWork.myWork`)}`,
    data: `${t(`component.lnb.data`)}`,
    run: `${t('page.runAutolabeling.autoLabelingRunHeader')}`,
    set: `${t(`page.autolabeling.autoLabelingSetHeader`)}`,
    classes: `${t(`component.lnb.tools`)}`,
    'export-results': `${t(`component.lnb.exportResults`)}`,
    'project-members': `${t(`component.lnb.projectMembers`)}`,
    'project-info': `${t(`component.lnb.projectInfo`)}`,
    members: `${t(`component.lnb.members`)}`,
    models: `${t(`component.lnb.models`)}`,
  };

  // '/' 를 기준으로 잘라 만든 pathArray 를 forEach 문으로
  // 새로운 path 를 만들고, breadState 로 저장해두는 함수.
  // 하지만 마지막 글자를 잘라 검사 했을 때 숫자로 끝나는 경우는
  // 유효하지 않은 url 임으로 제외시키고 배열을 만들어내고,
  // 해당 숫자는 프로젝트명을 띄우기 위해 projectId 로 저장해둡니다.
  // currentUnvalidURL 에 속하는 단어로 끝나는 겅우도 유효하지 않은 url 이기 때문에 제외합니다.
  const breadState: Array<string> = [];
  const currentUnvalidURL = ['admin', 'dashboard', 'auto-labeling'];

  const makePath = () => {
    pathArray.forEach((data, index) => {
      if (data !== '') {
        if (currentUnvalidURL.includes(data)) return;
        const lastStr = data.substring(data.length - 1, data.length);
        breadState.push(pathArray.slice(0, index + 1).join('/'));
        if (!Number.isNaN(Number(lastStr))) {
          projectId = data;
        }
      }
    });
  };
  makePath();

  // 브레드크럼에 프로젝트명을 띄우기 위해
  // projectId 로 정보를 가져옵니다.
  const { data: metaData } = useGetProjectMetaData({
    projectId: Number(projectId),
  });
  const projectName = metaData?.result.name;

  // currentPath 를 '/' 기준으로 자르고, 잘린 배열을 반복하여
  // 이어 붙여 만든 path 를 저장해둔 breadState 배열을 각 router명으로
  // 브레드크럼에 출력하기 위한 함수, breadState 의 길이만큼 for 문을 순회하며
  // 이어 붙인 path 를 자르고, 마지막 글자만 숫자인지 검사합니다.
  // routerName 에 하나씩 추가하게 되는데, 숫자라면 projectName 을
  // 숫자가 아니라면 pageNameArray 에서 이름이 같은 항목을 찾아내고
  // 해당 항목을 추가하게 됩니다.
  const routerName: any = [];

  const findRouter = () => {
    const Arr = Object.entries(pageNameArray);

    for (let j = 0; j < breadState.length; j++) {
      const splitPath = breadState[j].split('/');
      const lastPath = splitPath.slice(-1);

      if (!Number.isNaN(Number(lastPath[0]))) {
        routerName.push(projectName);
      } else {
        for (let i = 0; i < Arr.length; i++) {
          if (Arr[i][0] === lastPath[0]) {
            routerName.push(Arr[i][1]);
          }
        }
      }
    }
  };
  findRouter();

  // 브레드크럼의 각 항목마다 붙이게 되는 onClick 함수
  // 클릭시 해당 path 를 전달 받고 currentPath 와 같다면 return,
  // 마지막글자만 잘라 검사 했을 때 숫자라면 projectName 을 클릭했으므로
  // 해당 프로젝트의 HOME 메뉴인 프로젝트 대시보드로 이동시키기 위해
  // 전달 받은 path 뒤에 대시보드path 를 덧붙여 이동시킵니다.
  // 이때, currentPath 가 대시보드 라우터와 같다면 return
  const onBreadCrumbClick = (path: string) => {
    if (path === currentPath) return;

    const lastStr = path.substring(path.length - 1, path.length);

    if (!Number.isNaN(Number(lastStr))) {
      const joinDashboard = `${path}/dashboard/project`;

      if (joinDashboard === currentPath) return;
      navigate(joinDashboard);
    } else {
      navigate(path);
    }
  };

  // 워크스페이스명은 표시만 위해서 띄우기 때문에 Sypo 컴포넌트로 출력
  // breadState 를 map 함수를 통해 반복하여 div 로 출력합니다.
  // 출력할 때 사용자에게 보여주는 내용은 routerName 에 저장된 항목 출력,
  // 클릭시 전달하는 path 는 breadState 에 저장되어 있는 항목입니다.
  return (
    <div className={cx('bread-crumb-container')}>
      <div className={cx('workspace-name')}>
        <Sypo type='P1' weight={400}>
          {workspaceName}
        </Sypo>
      </div>
      {breadState.map((path, index) => (
        <div
          className={cx('bread-crumb-content')}
          key={`bread-crumb-content${index}`}
        >
          /
          <div onClick={() => onBreadCrumbClick(path)}>
            <Sypo type='P1' weight={400}>
              {routerName[index]}
            </Sypo>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BreadCrumb;
