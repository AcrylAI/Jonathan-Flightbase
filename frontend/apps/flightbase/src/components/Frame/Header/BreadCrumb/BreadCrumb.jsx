import { useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

// CSS Module
import classNames from 'classnames/bind';
import style from './BreadCrumb.module.scss';

const cx = classNames.bind(style);

function BreadCrumb() {
  const { t } = useTranslation();

  // Router hooks
  const history = useHistory();
  const match = useRouteMatch();

  // Redux hooks
  let breadCrumbState = useSelector((state) => state.breadCrumb);
  // 워크스페이스 이름 표시용
  const { workspaceState } = useSelector((state) => ({
    workspaceState: state.workspace,
  }));
  const workspaces = workspaceState?.workspaces || [];
  const { id: workspaceId } = match.params;
  let selectedWs;
  workspaces.map(({ name: label, id: value, favorites, status }) => {
    const wItem = { label, value, favorites, status };
    if (Number(workspaceId) === value) {
      selectedWs = wItem;
    }
    return wItem;
  });

  if (!Array.isArray(breadCrumbState)) {
    breadCrumbState = [];
  }
  return (
    <>
      <div
        className={cx(
          'path-wrap',
          breadCrumbState.length < 3 ? 'short' : 'long',
        )}
      >
        {selectedWs && (
          <div className={cx('path-box')}>
            <span
              title={t('Home')}
              className={cx('name', 'path', 'ws')}
              onClick={() => {
                history.push(`/user/workspace/${selectedWs.value}/home`);
              }}
            >
              {selectedWs.label}
            </span>
          </div>
        )}
        {breadCrumbState?.map(({ component }, idx) => (
          <div className={cx('path-box')} key={idx}>
            <span className={cx('separator')}>
              {component.name !== '' ? '/' : ''}
            </span>
            <span
              className={cx('name', component.path && 'path')}
              onClick={() => {
                if (component.path && component.name) {
                  history.push(component.path);
                }
              }}
            >
              {component.t ? (
                t(component.name)
              ) : (
                <span className={cx('var')}>{component?.name}</span>
              )}
              {component?.secondName && component?.secondName}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default BreadCrumb;
