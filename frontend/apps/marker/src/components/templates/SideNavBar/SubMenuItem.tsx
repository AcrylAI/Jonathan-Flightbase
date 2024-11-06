import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import useGetClassList from '@src/pages/AutoLabelingSetPage/hooks/useGetClassList';

// Components
import { Sypo } from '@src/components/atoms';

import { ADMIN_URL, urlInjector } from '@src/utils/pageUrls';

import useT from '@src/hooks/Locale/useT';

import { SubMenuListModel } from './SideNavBar';

// Icon
import { RightArrowIcon } from '@src/static/images';

import style from './SideNavBar.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type OpenMenuItem = {
  dashboard: boolean;
  autoLabeling: boolean;
};

const SubMenuItem = ({ list }: SubMenuListModel) => {
  const { t } = useT();
  const currentPath = window.location.pathname;
  const navigate = useNavigate();
  const { pid, name } = useParams();
  const response = useGetClassList({ projectId: Number(pid) });
  const [openMenuState, setOpenMenuState] = useState<OpenMenuItem>({
    dashboard: true,
    autoLabeling: false,
  });

  // 클릭 시 projectId || projectName 을 붙여 이동 시키는 클릭 함수,
  // path 가 대시보드나 오토라벨링을 포함하고 있다면 state 를 변경
  const onClickLink = (e: React.MouseEvent<HTMLDivElement>, path: string) => {
    e.preventDefault();

    if (pid === undefined && name === undefined)
      navigate(ADMIN_URL.PROJECTS_PAGE);

    const replacedPath = path
      .replace(':pid', pid ?? name ?? '')
      .replace(':name', pid ?? name ?? '');
    navigate(replacedPath);
    setOpenMenuState(() => ({
      dashboard: false,
      autoLabeling: false,
    }));

    if (path.includes('dashboard')) {
      setOpenMenuState((openMenuState) => ({
        ...openMenuState,
        dashboard: true,
      }));
    } else if (path.includes('auto-labeling')) {
      setOpenMenuState((openMenuState) => ({
        ...openMenuState,
        autoLabeling: true,
      }));
    }
  };

  // 화살표 클릭시 대시보드인지 오토라벨링인지에 따라
  // 하위 메뉴를 펼칩니다.
  const onArrowClick = (e: React.MouseEvent<HTMLDivElement>, type: string) => {
    e.stopPropagation();
    if (type === 'dashboard') {
      setOpenMenuState((openMenuState) => ({
        ...openMenuState,
        dashboard: !openMenuState.dashboard,
      }));
    } else if (type === 'auto-labeling') {
      setOpenMenuState((openMenuState) => ({
        ...openMenuState,
        autoLabeling: !openMenuState.autoLabeling,
      }));
    }
  };

  // 첫번째 하위 메뉴, 두번째 하위 메뉴에 따라 데이터를 다르게 전달
  // 오토라벨링의 경우 클래스 리스트 데이터의 length 가 0 이라면
  // 설정 페이지로 이동, 0 이 아니라면 실행 페이지로 이동
  return (
    <div className={cx('side-nav-submenu-wrapper')}>
      {list.map((data) => (
        <div className={cx('menu-wrapper')} key={`${data.key}`}>
          <div
            onClick={(e) => {
              if (
                response.data?.result.length === 0 &&
                data.key === 'auto-labeling'
              ) {
                onClickLink(e, data.path[1]);
              } else {
                onClickLink(e, data.path[0]);
              }
            }}
            style={{ textDecoration: 'none' }}
          >
            <div
              className={cx(
                'side-nav-submenu-list',
                currentPath.includes('dashboard') &&
                  data.key === 'dashboard' &&
                  'dashboard-menu',
                currentPath.includes('auto-labeling') &&
                  data.key === 'auto-labeling' &&
                  'auto-labeling-menu',
                currentPath.includes(data.key)
                  ? 'current-submenu'
                  : 'not-current-submenu',
              )}
            >
              <div className={cx('icon-title-wrapper')}>
                <img
                  src={data.icon}
                  className={cx(
                    'submenu-icon',
                    currentPath.includes(data.key)
                      ? 'current-submenu-icon'
                      : 'not-current-submenu-icon',
                  )}
                  alt=''
                />
                <p className={cx('side-nav-submenu-title')}>
                  <Sypo type='P2'>{data.title}</Sypo>
                </p>
              </div>
              {(data.key === 'dashboard' || data.key === 'auto-labeling') && (
                <div
                  className={cx('arrow-container')}
                  onClick={(e) => onArrowClick(e, data.key)}
                >
                  <img
                    alt=''
                    src={RightArrowIcon}
                    className={cx(
                      'item-arrow',
                      data.key === 'dashboard' &&
                        openMenuState.dashboard &&
                        'active-dash',
                      data.key === 'auto-labeling' &&
                        openMenuState.autoLabeling &&
                        'active-auto',
                    )}
                  />
                </div>
              )}
            </div>
          </div>
          {data.key === 'dashboard' && (
            <div
              className={cx(
                'lower-level-wrapper',
                openMenuState.dashboard && 'active',
              )}
            >
              <Link
                to={urlInjector(ADMIN_URL.PROJECTS_DASHBOARD_PAGE, {
                  pid: pid ?? '',
                })}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className={cx(
                    'lower-level-menu',
                    openMenuState.dashboard && 'active',
                    currentPath.includes('/dashboard/project') &&
                      'current-lower',
                  )}
                >
                  <p className={cx('lower-level-title')}>
                    <Sypo type='P2'>{t(`component.lnb.project`)}</Sypo>
                  </p>
                </div>
              </Link>
              <Link
                to={urlInjector(ADMIN_URL.MYWORK_DASHBOARD_PAGE, {
                  pid: pid ?? '',
                })}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className={cx(
                    'lower-level-menu',
                    openMenuState.dashboard && 'active',
                    currentPath.includes('/dashboard/mywork') &&
                      'current-lower',
                  )}
                >
                  <p className={cx('lower-level-title')}>
                    <Sypo type='P2'>{t(`component.lnb.myWork`)}</Sypo>
                  </p>
                </div>
              </Link>
            </div>
          )}
          {data.key === 'auto-labeling' && (
            <div
              className={cx(
                'lower-level-wrapper',
                openMenuState.autoLabeling && 'active',
              )}
            >
              <Link
                to={urlInjector(ADMIN_URL.AUTOLABELING_RUN_PAGE, {
                  pid: pid ?? '',
                })}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className={cx(
                    'lower-level-menu',
                    currentPath.includes('/auto-labeling/run') &&
                      'current-lower',
                  )}
                >
                  <p className={cx('lower-level-title')}>
                    <Sypo type='P2'>{t(`component.lnb.run`)}</Sypo>
                  </p>
                </div>
              </Link>
              <Link
                to={urlInjector(ADMIN_URL.AUTOLABELING_SET_PAGE, {
                  pid: pid ?? '',
                })}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className={cx(
                    'lower-level-menu',
                    currentPath.includes('/auto-labeling/set') &&
                      'current-lower',
                  )}
                >
                  <p className={cx('lower-level-title')}>
                    <Sypo type='P2'>{t(`component.lnb.set`)}</Sypo>
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SubMenuItem;
