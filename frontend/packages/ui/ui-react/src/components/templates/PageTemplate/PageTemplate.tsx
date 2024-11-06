import { useContext, useCallback, useEffect, useRef } from 'react';

import { PageTemplateContext } from './context';
import { PageTemplateValue } from './context/types';

// CSS Module
import classNames from 'classnames/bind';
import style from './PageTemplate.module.scss';
import { theme } from '@src/utils';

const cx = classNames.bind(style);

export interface PageTemplateArgs {
  theme?: ThemeType;
  headerRender?: (
    hideMenuBtn?: boolean,
    expandHandler?: () => void,
  ) => JSX.Element;
  sideNavRender?: () => JSX.Element;
  slidePanelRender: () => JSX.Element;
  footerRender?: () => JSX.Element;
  contentRef?: React.RefObject<HTMLDivElement>;
  children: any;
}

let timer: NodeJS.Timeout | undefined;
function PageTemplate({
  headerRender,
  sideNavRender,
  slidePanelRender,
  footerRender,
  contentRef,
  children,
  theme,
}: PageTemplateArgs) {
  // 사이드 네비게이션 ref
  const navAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  // 반응형 사이드 네비게이션 기준 너비
  const reponsiveWidth = 1200;

  // Context Hook
  // eslint-disable-next-line prettier/prettier
  const { isOpen, pageTemplateDispatch }: Partial<PageTemplateValue> =
    useContext(PageTemplateContext);

  // Events
  const expandHandler = useCallback(() => {
    pageTemplateDispatch({ type: isOpen ? 'CLOSE' : 'OPEN' });
  }, [pageTemplateDispatch, isOpen]);

  // Effect Hook
  useEffect(() => {
    const handleClick = (e: any) => {
      const screenWidth = document.body.offsetWidth;
      if (
        isOpen &&
        !e.target.closest('#side-menu-btn') &&
        !e.target.closest('.sidenav') &&
        screenWidth < reponsiveWidth
      ) {
        pageTemplateDispatch({ type: isOpen ? 'CLOSE' : 'OPEN' });
      }
    };

    // PopupMenu 컴포넌트가 마운트 될 때 documemnt에 팝업 닫기 이벤트 추가
    document.addEventListener('click', handleClick, false);
    return () => {
      // 현재 컴포넌트가 언마운트 되면 handleClick 이벤트 제거
      document.removeEventListener('click', handleClick, false);
    };
  }, [pageTemplateDispatch, isOpen]);

  useEffect(() => {
    const handleResize = () => {
      let openAttr: boolean;
      if (frameRef.current) {
        openAttr = frameRef.current.getAttribute('data-nav-open') === 'true';
      } else {
        return;
      }

      if (timer) return;
      timer = setTimeout(() => {
        const screenWidth = document.body.offsetWidth;
        if (screenWidth > reponsiveWidth && openAttr) {
          pageTemplateDispatch({ type: 'OPEN' });
        }

        timer = undefined;
      }, 200);
    };
    window.addEventListener('resize', handleResize, true);
    return () => {
      // 현재 컴포넌트가 언마운트 되면 handleClick 이벤트 제거
      window.removeEventListener('resize', handleResize, false);
    };
  }, [pageTemplateDispatch, frameRef]);

  return (
    <div
      className={cx(
        'frame',
        isOpen && 'open',
        theme,
        !sideNavRender && 'no-nav',
      )}
      ref={frameRef}
      data-nav-open={isOpen}
    >
      <>
        {headerRender && (
          <header className={cx('header-area')}>
            {headerRender(!sideNavRender, expandHandler)}
          </header>
        )}
        {sideNavRender && (
          <div
            className={`sidenav ${cx(
              'sidenav-area',
              !headerRender && 'no-header',
            )}`}
            ref={navAreaRef}
          >
            {sideNavRender()}
          </div>
        )}
        <div
          className={cx('content-area', !headerRender && 'no-header')}
          ref={contentRef}
        >
          <div
            className={cx(
              'content',
              !headerRender && 'no-header',
              !footerRender && 'no-footer',
            )}
          >
            {children}
          </div>
          {footerRender && (
            <footer className={cx('footer-area')}>{footerRender()}</footer>
          )}
        </div>
        {slidePanelRender}
        <section></section>
      </>
    </div>
  );
}

PageTemplate.defaultProps = {
  theme: theme.PRIMARY_THEME,
  headerRender: undefined,
  sideNavRender: undefined,
  footerRender: undefined,
  contentRef: null,
};

export default PageTemplate;
