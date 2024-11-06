import { useMemo, useEffect, useCallback, useRef, Suspense } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// Utils
import { today } from '@src/datetimeUtils';
import dayjs from 'dayjs';

// Hooks
import useScrollHook from '@src/hooks/useScrollHook';

// i18n
import { useTranslation } from 'react-i18next';

import {
  PageTemplate as PTemplate,
  Header,
  SideNav,
  Footer,
} from '@jonathan/ui-react';

// Actions
import { getWorkspacesAsync } from '@src/store/modules/workspace';

// Components
import UserSetting from '@src/components/Frame/Header/UserSetting';
import LangSetting from '@src/components/Frame/Header/LangSetting';
import WorkspaceSetting from '@src/components/Frame/SideNav/WorkspaceSetting';
import BreadCrumb from '@src/components/Frame/Header/BreadCrumb';
import ServicePortal from '@src/components/Frame/Header/ServicePortal';
import CompanyLogo from '@src/components/Frame/Header/CompanyLogo/CompanyLogo';
import Loading from '@src/components/atoms/loading/Loading';
import DeferredComponent from '@src/hooks/useDeferredComponent';
// import SlidePanel from '@src/components/Frame/SlidePanel';
// import QueueManager from '@src/components/organisms/QueueManager';
// import TaskStatus from '@src/components/organisms/TaskStatus';

import { PARTNER } from '@src/partner';

// CSS module
import classNames from 'classnames/bind';
import style from './PageTemplate.module.scss';

// Theme
import { theme } from '@src/utils';

const cx = classNames.bind(style);

// 모드
const MODE = import.meta.env.VITE_REACT_APP_MODE.toLowerCase();
// 통합로그인 모드 여부
const IS_INTEGRATION = MODE === 'integration';
// Copyright 연도
const year = dayjs().year();
// 업데이트 날짜
const UPDATE_DATE = import.meta.env.VITE_REACT_APP_UPDATE_DATE || today();
// 아크릴 로고 (Powered by ACRYL)
const IS_POWERED_BY = import.meta.env.VITE_REACT_APP_IS_POWERED_BY === 'true';
// 커스텀 서비스 매뉴얼 유무
const IS_MANUAL = import.meta.env.VITE_REACT_APP_IS_MANUAL === 'true';
// 매뉴얼 숨김 유무
const IS_HIDE_MANUAL = import.meta.env.VITE_REACT_APP_IS_HIDE_MANUAL === 'true';
// 사이드 헤더 영역
const sideHeaderContents = [<WorkspaceSetting />];
// 헤더 왼쪽 영역
const headerLeftBoxContents = [<BreadCrumb />];
// 헤더 오른쪽 영역
const headerRightBoxContents = [
  <UserSetting />,
  <LangSetting />,
  IS_POWERED_BY && <CompanyLogo />,
  IS_INTEGRATION && <ServicePortal />,
];

/**
 * PageTemplate 컴포넌트
 *
 * - @jonathan/ui-react의 PageTemplate 및 PageTemplateProvider 컴포넌트를 사용한 FB 페이지 템플릿 컴포넌트
 * @param {{ children: any, navList: Array<{ name: string; path: string; icon?: any }> }} props PageTemplate props
 * @returns {JSX.Element}
 */
function PageTemplate({ children, navList }) {
  // Router Hooks
  const { params, path: currentPath } = useRouteMatch();
  const { id: wid, did, tid, sid } = params;
  const { t } = useTranslation();
  const scrollBox = useRef();
  // 페이지 스크롤 관련 hook
  const [renderScrollToTopBtn] = useScrollHook(scrollBox.current);

  // Redux Hooks
  const dispatch = useDispatch();

  const onServiceManual = (service) => {
    const link = document.createElement('a');
    if (service === 'Flightbase') {
      if (IS_INTEGRATION) {
        link.href = `${
          import.meta.env.VITE_REACT_APP_INTEGRATION_API_HOST
        }manual/Flightbase_User_Guide.pdf`;
      } else {
        link.href = '/manual/Flightbase_User_Guide.pdf'; // 서버에 파일이름은 항상 동일하게 올리고
      }
      link.download = 'Flightbase_User_Guide_220513.pdf'; // 다운로드 받을 때 업데이트 날짜 들어가게 하기
      link.target = '_blank';
    } else if (service === 'Datascope') {
      link.href = `${
        import.meta.env.VITE_REACT_APP_INTEGRATION_API_HOST
      }manual/Datascope_User_Guide.pdf`;
      link.download = 'Datascope_User_Guide.pdf';
      link.target = '_blank';
    } else if (service === 'Nubot') {
      link.href = `${
        import.meta.env.VITE_REACT_APP_INTEGRATION_API_HOST
      }manual/Nubot_User_Guide.pdf`;
      link.download = 'Nubot_User_Guide.pdf';
      link.target = '_blank';
    }
    link.click();
    link.remove();
  };
  const makePath = useCallback(
    (path) =>
      path
        .replaceAll(':id', wid)
        .replaceAll(':did', did)
        .replaceAll(':tid', tid)
        .replaceAll(':sid', sid),
    [wid, did, tid, sid],
  );

  const { targetNavList } = useMemo(() => {
    let subMenuItem = navList.find(({ path }) => path === currentPath);
    if (subMenuItem && (subMenuItem.group || subMenuItem.subGroup)) {
      return {
        targetNavList: navList
          .filter(
            ({ group, subGroup }) =>
              !group ||
              (group && subMenuItem.group.target === group.target) ||
              (subGroup && subMenuItem.group.target === subGroup.target),
          )
          .map((n) => ({
            ...n,
            path: makePath(n.path),
          })),
      };
    }

    return {
      targetNavList: navList
        .filter(({ group }) => !group)
        .map((n) => ({
          ...n,
          path: makePath(n.path),
        })),
    };
  }, [navList, currentPath, makePath]);

  useEffect(() => {
    dispatch(getWorkspacesAsync());
  }, [dispatch]);

  return (
    <PTemplate
      headerRender={(hideMenuBtn, expandHandler) => (
        <Header
          theme={theme.PRIMARY_THEME}
          hideMenuBtn={hideMenuBtn}
          expandHandler={expandHandler}
          leftBoxContents={headerLeftBoxContents}
          rightBoxContents={headerRightBoxContents}
          isLogo={true}
          logoIcon={PARTNER[MODE]?.logo.header || PARTNER['jp'].logo.header}
          isExpand={true}
        />
      )}
      sideNavRender={
        currentPath !== '/user/dashboard'
          ? () => (
              <SideNav
                width={'184'}
                theme={theme.PRIMARY_THEME}
                headerContents={sideHeaderContents}
                navList={targetNavList}
                mode={MODE}
                isManual={IS_MANUAL}
                isHideManual={IS_HIDE_MANUAL}
                onServiceManual={onServiceManual}
                onNavigate={({ element, path, activeClassName, isActive }) => {
                  const isDisabled =
                    path.includes('hps') || path.includes('job');
                  return (
                    <NavLink
                      className={cx(isDisabled && 'disabled')}
                      to={path}
                      activeClassName={activeClassName}
                      isActive={isActive}
                      onClick={(e) => isDisabled && e.preventDefault()}
                    >
                      {element}
                    </NavLink>
                  );
                }}
                t={t}
              />
            )
          : null
      }
      // slidePanelRender={
      //   currentPath !== '/user/dashboard' && (
      //     <SlidePanel
      //       panels={[
      //         {
      //           Comp: QueueManager,
      //           iconSrc: '/images/icon/queue',
      //         },
      //         {
      //           Comp: TaskStatus,
      //           iconSrc: '/images/icon/resource',
      //         },
      //       ]}
      //     />
      //   )
      // }
      footerRender={() => (
        <Footer
          theme={theme.PRIMARY_THEME}
          logoIcon={PARTNER[MODE]?.logo.footer || PARTNER['jp'].logo.footer}
          copyrights={`© ${year} Acryl inc. All rights reserved.`}
          updated={UPDATE_DATE}
        />
      )}
      theme={theme.PRIMARY_THEME}
      contentRef={scrollBox}
    >
      <Suspense
        fallback={
          <DeferredComponent>
            <Loading />
          </DeferredComponent>
        }
      >
        {children}
        {renderScrollToTopBtn()}
      </Suspense>
    </PTemplate>
  );
}

export default PageTemplate;
