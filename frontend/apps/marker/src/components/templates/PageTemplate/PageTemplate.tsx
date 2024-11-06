import { ReactNode, useEffect, useRef, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { Case, Default, Switch, When } from '@jonathan/react-utils';

import { templateStore } from '@src/stores/globalStore';

import { Header, SideNavBar } from '@src/components/templates';

import useUserSession from '@src/hooks/auth/useUserSession';

import style from './PageTemplate.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type props = {
  children: ReactNode;
};

const PageTemplate = ({ children }: props) => {
  const {
    userSession: { isAdmin },
  } = useUserSession();
  const currentPath = window.location.pathname;
  const isProjectsPage =
    currentPath === ('/admin/projects' || '/user/projects');

  const setIsSideOpen = useSetRecoilState<boolean>(templateStore);
  const [topButton, setTopButton] = useState<boolean>(false);

  const sideNavRef = useRef<HTMLDivElement>(null);
  const sideButtonRef = useRef<HTMLDivElement>(null);
  const contentsRef = useRef<HTMLDivElement>(null);

  // 사이드네브 바깥 클릭 시 자동 닫힘 기능을 위해
  // 사이드네브 영역과 버튼 영역을 지정하여
  // 클릭 타켓이 영역에 포함되지 않을 경우를 계산하는 클릭 함수
  const onSideNavOutsideClick = (e: MouseEvent) => {
    e.stopPropagation();
    const sideArea = sideNavRef.current;
    const sideButton = sideButtonRef.current;
    if (sideArea && sideButton) {
      const sideChildren = sideArea.contains(e.target as Node);
      const sideBtnArea = sideButton.contains(e.target as Node);

      if (!sideChildren && !sideBtnArea) {
        setIsSideOpen(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', (e) => {
      onSideNavOutsideClick(e);
    });
    return () => {
      document.removeEventListener('mousedown', (e) => {
        onSideNavOutsideClick(e);
      });
    };
  });

  // scroll 시 실행되는 함수
  const handleScroll = () => {
    const scrollY = document.getElementById('contents-area')?.scrollTop;

    if (scrollY && scrollY > 200) {
      setTopButton(true);
    } else setTopButton(false);
  };

  // useEffect 로 스크롤을 감지하여 함수를 실행
  useEffect(() => {
    contentsRef.current?.addEventListener('scroll', handleScroll);

    return () => {
      contentsRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 클릭 시 페이지의 상단으로 이동시키는 클릭 함수
  const onTopClick = () => {
    contentsRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // isAdmin 일 때만 사이드네브 출력
  return (
    <div className={cx('container')}>
      <Header ref={sideButtonRef} />
      <div className={cx('contents-area', !isAdmin && 'user-layout')}>
        <When condition={isAdmin}>
          <SideNavBar ref={sideNavRef} />
        </When>
        <Switch>
          <Case condition={isAdmin}>
            <div className={cx('contents-area-background')}>
              <div
                className={cx('contents-inner-area')}
                ref={contentsRef}
                id='contents-area'
              >
                {children}
                <div
                  className={cx(
                    'top-button',
                    isProjectsPage && topButton && 'active',
                  )}
                  onClick={onTopClick}
                ></div>
              </div>
            </div>
          </Case>
          <Case condition={!isAdmin}>{children}</Case>
          <Default>
            <div className={cx('contents-area-background')}>
              <div className={cx('labeler-contents-inner-area')}>
                {children}
                <div
                  className={cx(
                    'top-button',
                    isProjectsPage && topButton && 'active',
                  )}
                  onClick={onTopClick}
                ></div>
              </div>
            </div>
          </Default>
        </Switch>
      </div>
    </div>
  );
};

export default PageTemplate;
