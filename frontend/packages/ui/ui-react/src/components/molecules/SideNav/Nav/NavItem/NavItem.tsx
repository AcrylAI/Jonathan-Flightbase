// import { NavLink } from 'react-router-dom';

// Utils
import { theme } from '@src/utils';

// CSS Module
import classNames from 'classnames/bind';
import style from './NavItem.module.scss';
const cx = classNames.bind(style);

interface NavItemArgs {
  name: string;
  path: string;
  icon: any;
  activeIcon: any;
  group: string | undefined;
  subGroup: string | undefined;
  isGroup: boolean | undefined;
  onNavigate: ({
    element,
    path,
    isActive,
    activeClassName,
  }: {
    element: JSX.Element;
    path: string;
    isActive: (match: any) => boolean;
    activeClassName: string;
  }) => JSX.Element;
  theme?: ThemeType;
}

function NavItem({
  name,
  path,
  icon: Icon,
  activeIcon: ActiveIcon,
  group,
  subGroup,
  isGroup,
  onNavigate,
  theme,
}: NavItemArgs) {
  const target = path.split('/').slice(-1)[0];
  const currentPath = window.location.href;
  let end = currentPath.split('/').slice(-1)[0];

  // Flightbase: 메뉴 없는 상세 페이지 상위 메뉴에 매칭
  if (end === 'files') {
    end = 'datasets';
  } else if (end === 'test') {
    end = 'services';
  } else if (end === 'worker') {
    end = 'workers';
  }

  return (
    <div
      className={cx(
        'nav-item',
        group && 'main-group',
        subGroup && 'sub-group',
        isGroup && 'group-head',
        theme,
        end === target && 'end-match', // 최하위 active 구분용
      )}
    >
      {onNavigate({
        element: (
          <>
            {subGroup && <div className={cx('sub-group-icon')}></div>}
            {Icon &&
              ActiveIcon &&
              !subGroup &&
              (typeof Icon === 'function' ? (
                <span className={cx('icon-wrap')}>
                  <ActiveIcon className={cx('active-ico')} />
                  <Icon className={cx('ico')} />
                </span>
              ) : (
                <span className={cx('icon-wrap')}>
                  <img
                    className={cx('active-ico')}
                    src={ActiveIcon}
                    alt={`${name} link`}
                  />
                  <img className={cx('ico')} src={Icon} alt={`${name} link`} />
                </span>
              ))}
            <span className={cx('text')}>{name}</span>
            {isGroup && <i className={cx('arrow')}></i>}
          </>
        ),
        path,
        activeClassName: cx('active'),
        isActive: (match: any) => {
          if (match) {
            const depth = match.path.split('/').length;
            if (!match.isExact && depth === 4) {
              return false;
            }
          }
          return match !== null;
        },
      })}
      {/* <NavLink
        to={path}
        activeClassName={cx('active')}
        isActive={(match) => {
          if (match) {
            const depth = match.path.split('/').length;
            if (!match.isExact && depth === 4) {
              return false;
            }
          }
          return match !== null;
        }}
      >
        {subGroup && <div className={cx('sub-group-icon')}></div>}
        {Icon &&
          ActiveIcon &&
          !subGroup &&
          (typeof Icon === 'function' ? (
            <span className={cx('icon-wrap')}>
              <ActiveIcon className={cx('active-ico')} />
              <Icon className={cx('ico')} />
            </span>
          ) : (
            <span className={cx('icon-wrap')}>
              <img
                className={cx('active-ico')}
                src={ActiveIcon}
                alt={`${name} link`}
              />
              <img className={cx('ico')} src={Icon} alt={`${name} link`} />
            </span>
          ))}
        <span className={cx('text')}>{name}</span>
        {isGroup && <i className={cx('arrow')}></i>}
      </NavLink> */}
    </div>
  );
}

NavItem.defaultProps = {
  theme: theme.PRIMARY_THEME,
};

export default NavItem;
