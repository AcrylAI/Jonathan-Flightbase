import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouteMatch, useHistory } from 'react-router-dom';

// Components
import { InputText } from '@jonathan/ui-react';
import Status from '@src/components/atoms/Status';
import Tab from '@src/components/molecules/Tab';
import Popup from '@src/components/Frame/Header/Popup';

// Actions
import { getWorkspacesAsync } from '@src/store/modules/workspace';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// CSS Module
import classNames from 'classnames/bind';
import style from './WorkspaceSetting.module.scss';

const cx = classNames.bind(style);

// Image
const arrowIconPath = '/images/icon/ic-arrow-down-skyblue.svg';
const bookmarkIconPath = '/images/nav/icon-star-o.svg';
const bookmarkIconActivePath = '/images/nav/icon-star-c.svg';

/**
 * 워크스페이스 변경 컴포넌트
 * @component
 * @example
 *
 * return (
 *  <WorkspaceSetting />
 * )
 *
 * -
 */
function WorkspaceSetting() {
  // Redux hooks
  const { workspaceState } = useSelector((state) => ({
    workspaceState: state.workspace,
  }));
  const [isOpen, setIsOpen] = useState(false);
  const workspaces = workspaceState?.workspaces || [];
  const dispatch = useDispatch();

  // Router hooks
  const match = useRouteMatch();
  const history = useHistory();

  const { id: workspaceId } = match.params;

  // Component state
  const option = [
    { label: 'All', value: 0 },
    { label: 'Favorites', value: 1 },
  ];
  const [tab, setTab] = useState({ label: 'All', value: 0 });
  const [search, setSearch] = useState('');

  let selectedWs;
  const workspaceList = workspaces.map(
    ({ name: label, id: value, favorites, status }) => {
      const wItem = { label, value, favorites, status };
      if (Number(workspaceId) === value) {
        selectedWs = wItem;
      }
      return wItem;
    },
  );

  // Event
  const onSearch = (e) => {
    const { value } = e.target;
    setSearch(value);
  };

  const tabHandler = (v) => {
    setTab(v);
  };
  const popupHandler = (flag) => {
    if (flag === true || flag === false) {
      setIsOpen(flag);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const changeWorkspace = (v) => {
    const newPath = `/user/workspace/${v.value}/home`;
    history.push(newPath);
    popupHandler();
  };

  // 워크스페이스 별표 활성화(즐겨찿기)
  const setBookmark = async (id, action) => {
    const response = await callApi({
      url: 'workspaces/favorites',
      method: 'post',
      body: {
        workspace_id: id,
        action,
      },
    });
    const { status } = response;
    if (status === STATUS_SUCCESS) {
      dispatch(getWorkspacesAsync());
    }
  };
  const wsList = workspaceList
    .filter(({ label }) =>
      search === '' ? true : label.indexOf(search) !== -1,
    )
    .filter(({ favorites }) => (tab.value === 1 ? favorites === 1 : true));

  return (
    <div className={cx('workspace-setting')}>
      {selectedWs && (
        <div
          className={cx('workspace-select', isOpen && 'active')}
          onClick={(e) => {
            e.stopPropagation();
            popupHandler();
          }}
        >
          <div className={cx('name')}>{selectedWs.label}</div>
          <div className={cx('arrow-box')}>
            <img
              className={cx('workspace-down-arrow')}
              src={arrowIconPath}
              alt='arrow'
            />
          </div>
        </div>
      )}
      {isOpen && (
        <Popup popupHandler={popupHandler} position='left'>
          <div className={cx('popup-box')}>
            <div className={cx('search-box')}>
              <InputText
                size='medium'
                placeholder=''
                value={search}
                onChange={onSearch}
                leftIcon='/images/icon/ic-search.svg'
                disableLeftIcon={false}
                disableClearBtn={true}
              />
            </div>
            <div className={cx('list-box')}>
              <Tab
                option={option}
                select={tab}
                tabHandler={tabHandler}
                type='c'
              />
              <div className={cx('list-wrap')}>
                <ul className={cx('ws-list')}>
                  {wsList.map((v, i) => (
                    <li key={i} className={cx(v.status)}>
                      <span
                        className={cx('bookmark-btn')}
                        onClick={() =>
                          setBookmark(v.value, v.favorites === 1 ? 0 : 1)
                        }
                      >
                        <img
                          src={
                            v.favorites === 1
                              ? bookmarkIconActivePath
                              : bookmarkIconPath
                          }
                          alt='bookmark'
                          className={cx('ic-star')}
                        />
                      </span>
                      <button
                        className={cx('change-ws-btn', v.status)}
                        onClick={() => changeWorkspace(v)}
                        disabled={v.status === 'expired'}
                      >
                        <Status status={v.status} size='small' />
                        <span className={cx('name')}>{v.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
}

export default WorkspaceSetting;
