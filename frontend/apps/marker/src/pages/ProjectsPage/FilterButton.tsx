import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import {
  ProjectsContentsAtom,
  ProjectsContentsAtomModel,
} from '@src/stores/components/pageContents/ProjectsContentsAtom/ProjectsContentsAtom';

import { Sypo } from '@src/components/atoms';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

import styles from './ProjectsPage.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type FilterType = {
  activation: 0 | 1 | 2;
  authority: 0 | 1 | 2;
};

type ButtonType = {
  left: boolean;
  center: boolean;
  right: boolean;
};

const FilterButton = () => {
  const {
    userSession: { isAdmin },
  } = useUserSession();

  const { t } = useT();
  const [filterState, setFilterState] =
    useRecoilState<ProjectsContentsAtomModel>(ProjectsContentsAtom);
  const [filter, setFilter] = useState<FilterType>({
    activation: 0,
    authority: 0,
  });
  const [activationButtonHover, setActivationButtonHover] =
    useState<ButtonType>({
      left: false,
      center: false,
      right: false,
    });
  const [authorityButtonHover, setAuthorityButtonHover] = useState<ButtonType>({
    left: false,
    center: false,
    right: false,
  });

  const handleFilterClick = (
    type: 'activation' | 'authority',
    value: 0 | 1 | 2,
  ) => {
    const temp = { ...filter };
    // 필터 값 할당
    if (type === 'activation') {
      // 같은 버튼이 아닐시 값 할당, 같은 버튼이라면 선택 해제
      temp.activation = value === temp.activation ? 0 : value;
    } else if (type === 'authority') {
      temp.authority = value === temp.authority ? 0 : value;
    }
    setFilter(temp);
  };

  // 필터값을 recoilState 에 업데이트 시키는 함수
  const handleFilter = (isClear: boolean = false) => {
    const temp = _.cloneDeep(filterState);
    temp.filter1 = filter.authority;
    temp.filter2 = filter.activation;

    if (isClear) {
      temp.filter1 = 0;
      temp.filter2 = 0;

      setFilter({ activation: 0, authority: 0 });
    }
    setFilterState(temp);
  };

  useEffect(() => {
    handleFilter();
  }, [filter]);

  // hover 효과를 위한 함수
  const handleFilterhover = (
    type: 'activation' | 'authority',
    value: ButtonType,
  ) => {
    if (type === 'activation') {
      setActivationButtonHover(value);
    } else {
      setAuthorityButtonHover(value);
    }
  };

  return (
    <div className={cx('filter-button-container')}>
      <div className={cx('filter-button-wrapper')}>
        <div className={cx('button-title-wrapper')}>
          <Sypo type='P2' weight='R'>
            <p className={cx('button-title')}>
              {t(`page.projectList.activation`)}
            </p>
          </Sypo>
          <div className={cx('triple-button', 'activation-button')}>
            <div
              className={cx(
                'filter-button',
                'all-button',
                'activation',
                filter.activation === 0 && 'selected',
                activationButtonHover.left && 'hover',
              )}
              onClick={() => handleFilterClick('activation', 0)}
              onMouseOver={() => {
                handleFilterhover('activation', {
                  left: true,
                  center: false,
                  right: false,
                });
              }}
              onMouseLeave={() =>
                handleFilterhover('activation', {
                  left: false,
                  center: false,
                  right: false,
                })
              }
            >
              <Sypo type='P2' weight='R'>
                <p>{t(`page.projectList.all`)}</p>
              </Sypo>
            </div>
            <div
              className={cx(
                'left-border',
                (filter.activation === 0 || filter.activation === 1) &&
                  'active',
                (activationButtonHover.left || activationButtonHover.center) &&
                  'hover',
              )}
            ></div>
            <div
              className={cx(
                'filter-button',
                'active-button',
                filter.activation === 1 && 'selected',
                activationButtonHover.center && 'hover',
              )}
              onClick={() => handleFilterClick('activation', 1)}
              onMouseOver={() =>
                handleFilterhover('activation', {
                  left: false,
                  center: true,
                  right: false,
                })
              }
              onMouseLeave={() =>
                handleFilterhover('activation', {
                  left: false,
                  center: false,
                  right: false,
                })
              }
            >
              <Sypo type='P2' weight='R'>
                <p>{t(`page.projectList.active`)}</p>
              </Sypo>
            </div>
            <div
              className={cx(
                'right-border',
                (filter.activation === 1 || filter.activation === 2) &&
                  'active',
                (activationButtonHover.center || activationButtonHover.right) &&
                  'hover',
              )}
            ></div>
            <div
              className={cx(
                'filter-button',
                'inactive-button',
                filter.activation === 2 && 'selected',
                activationButtonHover.right && 'hover',
              )}
              onClick={() => handleFilterClick('activation', 2)}
              onMouseOver={() =>
                handleFilterhover('activation', {
                  left: false,
                  center: false,
                  right: true,
                })
              }
              onMouseLeave={() =>
                handleFilterhover('activation', {
                  left: false,
                  center: false,
                  right: false,
                })
              }
            >
              <Sypo type='P2' weight='R'>
                <p>{t(`page.projectList.inactive`)}</p>
              </Sypo>
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className={cx('button-title-wrapper')}>
            <Sypo type='P2' weight='R'>
              <p className={cx('button-title')}>
                {t(`page.projectList.authority`)}
              </p>
            </Sypo>
            <div className={cx('triple-button', 'authority-button')}>
              <div
                className={cx(
                  'filter-button',
                  'all-button',
                  'authority',
                  filter.authority === 0 && 'selected',
                  authorityButtonHover.left && 'hover',
                )}
                onClick={() => handleFilterClick('authority', 0)}
                onMouseOver={() =>
                  handleFilterhover('authority', {
                    left: true,
                    center: false,
                    right: false,
                  })
                }
                onMouseLeave={() =>
                  handleFilterhover('authority', {
                    left: false,
                    center: false,
                    right: false,
                  })
                }
              >
                <Sypo type='P2' weight='R'>
                  <p>{t(`page.projectList.all`)}</p>
                </Sypo>
              </div>
              <div
                className={cx(
                  'left-border',
                  (filter.authority === 0 || filter.authority === 2) &&
                    'active',
                  (authorityButtonHover.left || authorityButtonHover.center) &&
                    'hover',
                )}
              ></div>
              <div
                className={cx(
                  'filter-button',
                  'owner-button',
                  filter.authority === 2 && 'selected',
                  authorityButtonHover.center && 'hover',
                )}
                onClick={() => handleFilterClick('authority', 2)}
                onMouseOver={() =>
                  handleFilterhover('authority', {
                    left: false,
                    center: true,
                    right: false,
                  })
                }
                onMouseLeave={() =>
                  handleFilterhover('authority', {
                    left: false,
                    center: false,
                    right: false,
                  })
                }
              >
                <Sypo type='P2' weight='R'>
                  <p>{t(`page.projectList.owner`)}</p>
                </Sypo>
              </div>
              <div
                className={cx(
                  'right-border',
                  (filter.authority === 2 || filter.authority === 1) &&
                    'active',
                  (authorityButtonHover.center || authorityButtonHover.right) &&
                    'hover',
                )}
              ></div>
              <div
                className={cx(
                  'filter-button',
                  'invited-button',
                  filter.authority === 1 && 'selected',
                  authorityButtonHover.right && 'hover',
                )}
                onClick={() => handleFilterClick('authority', 1)}
                onMouseOver={() =>
                  handleFilterhover('authority', {
                    left: false,
                    center: false,
                    right: true,
                  })
                }
                onMouseLeave={() =>
                  handleFilterhover('authority', {
                    left: false,
                    center: false,
                    right: false,
                  })
                }
              >
                <Sypo type='P2' weight='R'>
                  <p>{t(`page.projectList.invited`)}</p>
                </Sypo>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterButton;
