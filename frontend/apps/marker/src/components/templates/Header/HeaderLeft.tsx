import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { templateStore } from '@src/stores/globalStore';

import { Sypo } from '@src/components/atoms';

import useUserSession from '@src/hooks/auth/useUserSession';

import BreadCrumb from './BreadCrumb';

// Logo
import {
  DownArrowIcon,
  DroneIcon,
  HamburgerIcon,
  WhiteLogo,
} from '@src/static/images';

import style from './Header.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const MODE = import.meta.env.VITE_REACT_APP_MODE.toLowerCase();

const HeaderLeft = forwardRef<HTMLDivElement>((_, ref) => {
  const [innerWidth, setInnerWidth] = useState<number>(window.innerWidth);
  const [isSideOpen, setIsSideOpen] = useRecoilState<boolean>(templateStore);
  const currentPath = window.location.pathname;

  const {
    userSession: { isAdmin },
  } = useUserSession();

  // JPUser or 라벨러 에 따라 다르게 path 를 반환하는 함수
  const top = useMemo(() => {
    if (isAdmin) return '/admin/projects';
    return '/user/projects';
  }, [isAdmin]);

  // 햄버거 버튼 클릭 함수
  const onSideButtonClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsSideOpen(!isSideOpen);
  };

  // 현재 창 너비가 바뀌면 그 값을 가져오는 함수
  useEffect(() => {
    const widthListener = () => {
      setInnerWidth(window.innerWidth);
    };
    window.addEventListener('resize', widthListener);
  }, []);

  // 현재 창 너비 값에 따라 햄버거 버튼 출력 || 미출력
  return (
    <div className={cx('left-section')}>
      {innerWidth < 1200 && isAdmin && (
        <div
          className={cx('side-nav-button')}
          onClick={onSideButtonClick}
          ref={ref}
        >
          <img src={HamburgerIcon} alt='' />
        </div>
      )}

      <Link to={top}>
        <div className={cx('home-button-wrapper')}>
          {!isAdmin && currentPath.includes('dashboard') && (
            <img src={DownArrowIcon} className={cx('arrow-icon')} alt='' />
          )}
          {MODE === 'etri' ? (
            <div className={cx('drone-logo')}>
              <img
                src={DroneIcon}
                className={cx('marker-logo')}
                alt='DNA+DRONE'
              />
              <Sypo type='h4'>데이터 어노테이션 도구</Sypo>
            </div>
          ) : (
            <img src={WhiteLogo} className={cx('marker-logo')} alt='MARKER' />
          )}
        </div>
      </Link>
      {isAdmin && (
        <div className={cx('header-bread-crumb')}>
          <BreadCrumb />
        </div>
      )}
    </div>
  );
});

export default HeaderLeft;
