import { useLocation, useNavigate } from 'react-router-dom';
// Recoil
import { useRecoilState } from 'recoil';

import { selectedSideMenuItem } from '@src/stores/globalStore';

// Components
import { Sypo } from '@src/components/atoms';

import { MenuListItem, SubMenuListModel } from './SideNavBar';
import SubMenuItem from './SubMenuItem';

import style from './SideNavBar.module.scss';
// CSS
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type SideMenuItemProps = {
  list: Array<MenuListItem>;
  subList: Array<SubMenuListModel>;
};

const SideMenuItem = ({ list, subList }: SideMenuItemProps) => {
  const location = useLocation();
  const navigator = useNavigate();

  const [selectedMenu, setSelectedMenu] =
    useRecoilState<string>(selectedSideMenuItem);

  const currentPath = location.pathname;

  return (
    <>
      {list.map((data) => (
        <div className={cx('menu-wrapper')} key={`side-nav-menu-${data.key}`}>
          {/* currentPath 와 data의 path 가 같을 경우 현재 메뉴 CSS,
           두 갈래로 나뉘는 메뉴들이 있기 때문에 [0] 와 비교
           currentPath 가 key 를 포함하고 있고, path[0] 보다 길이가 길다면
           대시보드나 오토라벨링의 하위 메뉴이므로 upper class 를 추가합니다. */}
          <div
            className={cx(
              'side-nav-menu-list',
              currentPath === data.path[0]
                ? 'current-menu'
                : 'not-current-menu',
              currentPath.includes(data.key) &&
                currentPath.length > data.path[0].length &&
                'current-upper',
            )}
            onClick={() => {
              setSelectedMenu(data.key);
              navigator(data.path[0]);
            }}
          >
            <div className={cx('nav-item-title')}>
              <img
                alt=''
                src={data.icon}
                className={cx(
                  'nav-item-title-icon',
                  currentPath === data.path[0] ||
                    (data.key === 'projects' && currentPath.includes(data.key))
                    ? 'current-menu'
                    : 'not-current-menu',
                )}
              />
              <p className={cx('nav-item-title-text')}>
                <Sypo type='P2'>{data.title}</Sypo>
              </p>
            </div>
          </div>
          {/* key 가 프로젝트일 때만 프로젝트 메뉴의 하위 메뉴를 출력 */}
          {data.key === 'projects' &&
            currentPath.includes('/projects') &&
            currentPath.length > data.path[0].length && (
              <SubMenuItem {...subList[0]} />
            )}
        </div>
      ))}
    </>
  );
};

export default SideMenuItem;
