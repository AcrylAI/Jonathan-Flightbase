import i18n from 'react-i18next';

// Components
import NavItem from './NavItem';

// Utils
import { theme } from '@src/utils';

// CSS Module
import classNames from 'classnames/bind';
import style from './Nav.module.scss';

const cx = classNames.bind(style);

export interface NavArgs {
  navList?: Array<{
    name: string;
    path: string;
    icon?: any;
    activeIcon?: any;
    isGroup?: boolean;
    isFirstGroup?: boolean;
    isLastGroup?: boolean;
    group?: string;
    subGroup?: string;
    disabled?: boolean;
  }>;
  theme?: ThemeType;
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
  t?: i18n.TFunction<'translation'>;
}

function Nav({ navList = [], theme, onNavigate, t }: NavArgs) {
  return (
    <div className={cx('nav-list', theme)}>
      {navList.map(
        (
          {
            name,
            path,
            icon: Icon,
            activeIcon: ActiveIcon,
            group,
            subGroup,
            isGroup,
            isFirstGroup,
            isLastGroup,
            disabled,
          },
          key,
        ) =>
          !disabled ? (
            <div
              key={key}
              className={cx(
                'nav-wrap',
                group && 'main-group',
                subGroup && 'sub-group',
                isFirstGroup && 'first-group',
                isLastGroup && 'last-group',
              )}
            >
              <NavItem
                key={key}
                name={t ? t(name) : name}
                path={path}
                icon={Icon}
                activeIcon={ActiveIcon}
                isGroup={isGroup}
                group={group}
                subGroup={subGroup}
                theme={theme}
                onNavigate={onNavigate}
              />
            </div>
          ) : null,
      )}
    </div>
  );
}

Nav.defaultProps = {
  navList: [],
  theme: theme.PRIMARY_THEME,
  t: undefined,
};

export default Nav;
