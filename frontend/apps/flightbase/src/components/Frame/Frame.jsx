import { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Utils
import { today } from '@src/datetimeUtils';
import dayjs from 'dayjs';

// Actions
import { closeNav, openNav } from '@src/store/modules/nav';

// Components
import { Footer } from '@jonathan/ui-react';
// import Footer from './Footer';
import UploadListContainer from '@src/containers/UploadListContainer';
import BackgroundLoading from '@src/components/atoms/loading/BackgroundLoading';
import ContentsLoading from '@src/components/atoms/loading/ContentsLoading';

// Hooks
import useScrollHook from '@src/hooks/useScrollHook';

// 커스텀 정의
import { PARTNER } from '@src/partner';

// Theme
import { theme } from '@src/utils';

// CSS Module
import classNames from 'classnames/bind';
import style from './Frame.module.scss';

const cx = classNames.bind(style);

const MODE = import.meta.env.VITE_REACT_APP_MODE.toLowerCase();
// 업데이트 날짜
const UPDATE_DATE = import.meta.env.VITE_REACT_APP_UPDATE_DATE || today();
// Copyright 연도
const year = dayjs().year();

/**
 * 
 * @param {JSX.Element} children 자식 요소 
 * @component
 * @example
 * 
 * return (
 *  <Frame
 *    headerRender={<AdminHeader />}
 *    sideNavRender={<SideNav />}
 *    slidePanelRender={
        <SlidePanel
          panels={[
            {
              Comp: QueueManager,
              iconSrc: '/images/icon/queue',
            },
            {
              Comp: TaskStatus,
              iconSrc: '/images/icon/resource',
            },
          ]}
        />
      }
 *  >
 *    <div> children </div>
 *  </Frame>
 * )
 * 
 *-
 */
function Frame({
  bgColor,
  headerRender,
  sideNavRender,
  slidePanelRender,
  children,
  type,
}) {
  const scrollBox = useRef();
  // Redux hooks
  const dispatch = useDispatch();
  const { nav: navState, contentsLoading } = useSelector((state) => ({
    nav: state.nav,
    contentsLoading: state.loading.contentsLoading,
  }));
  const { isExpand } = navState;

  // Custom hooks
  // 페이지 스크롤 관련 hook
  const [renderScrollToTopBtn] = useScrollHook(scrollBox.current);

  // LifeCycle
  useEffect(() => {
    const { innerWidth } = window;
    if (innerWidth <= 1023) {
      dispatch(closeNav());
    } else {
      dispatch(openNav());
    }
  }, [dispatch]);

  return (
    <div className={cx('frame')}>
      {/* Header */}
      <div className={cx('header')}>{headerRender}</div>
      <div className={cx('wrapper', isExpand ? 'expand' : 'contract')}>
        {/* Side Nav */}
        {sideNavRender && <div className={cx('side-nav')}>{sideNavRender}</div>}
        <div
          id='content-scroll-box'
          className={cx('content', !sideNavRender && 'no-nav')}
          ref={scrollBox}
        >
          {/* Content */}
          <div
            className={cx('page-content')}
            style={{ backgroundColor: bgColor }}
          >
            {contentsLoading.loading ? <ContentsLoading /> : children}
            {renderScrollToTopBtn()}
          </div>
          {/* Footer */}
          <div className={cx('footer')}>
            {/* <Footer type={type} isExpand={isExpand} /> */}
            <Footer
              theme={theme.PRIMARY_THEME}
              logoIcon={PARTNER[MODE]?.logo.footer || PARTNER['jp'].logo.footer}
              copyrights={`© ${year} Acryl inc. All rights reserved.`}
              updated={UPDATE_DATE}
            />
          </div>
        </div>
        <UploadListContainer />
      </div>
      <BackgroundLoading />
      {/* Slide Panel */}
      {slidePanelRender}
    </div>
  );
}

export default Frame;
