import React, { useLayoutEffect, useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { useLocation, useParams } from 'react-router-dom';

import { Case, Default, Switch } from '@jonathan/react-utils';
import { ClickAwayListener } from '@jonathan/react-utils';

import { Sypo } from '../../Typography/Typo';

import { MONO201 } from '@src/utils/color';

import useGetProjectMetaData from '@src/hooks/Api/useGetProjectMetaData';
import useTransfer from '@src/hooks/Common/useTransfer';
import useT from '@src/hooks/Locale/useT';

import { useGetJobCount } from './hooks/useGetJobCount';

import styles from './FloatingCircle.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
const TOGGLE_WIDTH = 64;
const TOGGLE_HEIGHT = 48;
const CONTENT_WIDTH = 151;
const CONTENT_HEIGHT = 176;

const SAFETY_VALUE = 8;
const MOVE_SAFETY = 16;
const DIM_COLOR = '#72737F';
type IconType = {
  disabled: boolean;
};
const TalkBoxIcon = ({ disabled }: IconType) => {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 18 18'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M9.00001 0.875C7.58892 0.874893 6.20212 1.24229 4.97617 1.94101C3.75022 2.63973 2.72737 3.64569 2.00834 4.85985C1.28931 6.074 0.898885 7.45448 0.875505 8.86538C0.852126 10.2763 1.1966 11.6689 1.87501 12.9062L1.21094 15.25C1.149 15.4636 1.14551 15.6899 1.20086 15.9052C1.25621 16.1206 1.36836 16.3172 1.5256 16.4744C1.68284 16.6316 1.87941 16.7438 2.09478 16.7991C2.31015 16.8545 2.53644 16.851 2.75001 16.7891L5.09376 16.125C6.17992 16.7203 7.3878 17.0594 8.6251 17.1164C9.86239 17.1734 11.0963 16.9467 12.2326 16.4538C13.3689 15.9608 14.3774 15.2146 15.1811 14.2721C15.9848 13.3297 16.5624 12.216 16.8698 11.0161C17.1771 9.81624 17.2061 8.56199 16.9544 7.34922C16.7028 6.13645 16.1772 4.99727 15.4178 4.01874C14.6585 3.04022 13.6854 2.24825 12.5731 1.70339C11.4608 1.15852 10.2386 0.875172 9.00001 0.875Z'
        fill={disabled ? DIM_COLOR : MONO201}
      />
    </svg>
  );
};
const TagWhiteIcon = ({ disabled }: IconType) => {
  return (
    <svg
      width='19'
      height='19'
      viewBox='0 0 19 19'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M17.75 8.91458L9.58597 0.750519C9.44145 0.604725 9.26306 0.497019 9.06674 0.437032C8.87042 0.377045 8.66229 0.366647 8.46097 0.406769L2.15628 1.67239C2.03673 1.69627 1.92693 1.75501 1.84073 1.84121C1.75452 1.92742 1.69578 2.03722 1.67191 2.15677L0.40628 8.46146C0.366159 8.66278 0.376557 8.87091 0.436544 9.06723C0.496531 9.26355 0.604237 9.44194 0.75003 9.58646L8.91409 17.7505C9.0296 17.8672 9.1671 17.9598 9.31863 18.0231C9.47016 18.0863 9.63272 18.1188 9.79691 18.1188C9.96109 18.1188 10.1237 18.0863 10.2752 18.0231C10.4267 17.9598 10.5642 17.8672 10.6797 17.7505L17.75 10.6802C17.8667 10.5647 17.9594 10.4272 18.0226 10.2757C18.0858 10.1241 18.1183 9.96158 18.1183 9.79739C18.1183 9.63321 18.0858 9.47065 18.0226 9.31911C17.9594 9.16758 17.8667 9.03009 17.75 8.91458ZM5.56253 6.50052C5.37711 6.50052 5.19586 6.44554 5.04168 6.34252C4.88751 6.23951 4.76735 6.09309 4.69639 5.92178C4.62544 5.75048 4.60687 5.56198 4.64304 5.38012C4.67922 5.19826 4.76851 5.03122 4.89962 4.90011C5.03073 4.76899 5.19778 4.67971 5.37963 4.64353C5.56149 4.60736 5.74999 4.62593 5.9213 4.69688C6.0926 4.76784 6.23902 4.888 6.34203 5.04217C6.44505 5.19634 6.50003 5.3776 6.50003 5.56302C6.50003 5.81166 6.40126 6.05012 6.22544 6.22593C6.04963 6.40175 5.81117 6.50052 5.56253 6.50052Z'
        fill={disabled ? DIM_COLOR : MONO201}
      />
    </svg>
  );
};
const CloseGrayIcon = () => {
  return (
    <svg
      width='32'
      height='32'
      viewBox='0 0 32 32'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect width='32' height='32' rx='16' fill='#F9FAFB' fillOpacity='0.1' />
      <path
        d='M20.5 11.5L11.5 20.5'
        stroke='white'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M20.5 20.5L11.5 11.5'
        stroke='white'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};
const MyWorkPencilIcon = () => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M7.54922 5.85056C7.49248 5.65041 7.59863 5.44019 7.79337 5.36702L11.9721 3.79705C12.1668 3.72389 12.3851 3.81221 12.4742 4.00021L16.2557 11.9801C16.3559 12.1915 16.254 12.4435 16.0349 12.5258L10.4832 14.6116C10.2642 14.6939 10.0216 14.5714 9.95773 14.3463L7.54922 5.85056Z'
        fill='#f9fafb'
      />
      <path
        d='M10.7917 15.7493C10.5879 15.5432 10.6641 15.1955 10.9354 15.0935L16.1487 13.1349C16.4193 13.0332 16.705 13.2433 16.6887 13.5318L16.515 16.6164C16.5059 16.7775 16.4009 16.9174 16.2487 16.9711L13.3391 17.9981C13.1931 18.0496 13.0305 18.0122 12.9216 17.9022L10.7917 15.7493Z'
        fill='#f9fafb'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M13.8867 18.4491L16.1311 17.6261C16.3359 17.551 16.5631 17.6539 16.6419 17.8573L17.4893 20.0465C17.5908 20.3086 17.3973 20.5909 17.1163 20.5909H16.9H14.5708H6.90002C6.62388 20.5909 6.40002 20.367 6.40002 20.0909C6.40002 19.8147 6.62388 19.5909 6.90002 19.5909H13.9L13.653 18.9732C13.5692 18.7639 13.675 18.5267 13.8867 18.4491Z'
        fill='#f9fafb'
      />
    </svg>
  );
};

type JobCountType = {
  labelCount: number;
  reviewCount: number;
};

type Pos = {
  x: number;
  y: number;
};
const FloatingCircle = () => {
  const { t } = useT();
  // localhost 에서 좌표 가져올때 상황 값을 적용하는 로직필요
  const [jobCount, setJobCount] = useState<JobCountType>({
    labelCount: 0,
    reviewCount: 0,
  });
  const [yReverse, setYReverse] = useState<boolean>(false);
  const [xReverse, setXReverse] = useState<boolean>(false);
  const [isGrab, setIsGrab] = useState<boolean>(false);
  // event listener 내부에서 드래그 관련 확인값
  const grabRef = useRef<boolean>(false);
  const startPosRef = useRef<Pos>({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [pid, setPid] = useState<number>(0);
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(CONTENT_HEIGHT);

  const { data, isLoading } = useGetJobCount({
    projectId: pid,
    disable: !visible || !pid,
  });
  const { data: metaData } = useGetProjectMetaData({ projectId: pid });
  const { moveToLabeling, moveToReview } = useTransfer();

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsGrab(true);
    if (startPosRef.current) {
      startPosRef.current.x = e.clientX;
      startPosRef.current.y = e.clientY;
    }
  };
  const handleMouseUp = () => {
    if (!isMoving && !active) {
      setActive(true);
    }
    setIsGrab(false);
    setIsMoving(false);
    if (startPosRef.current) {
      startPosRef.current.x = 0;
      startPosRef.current.y = 0;
    }
  };
  const handleOpen = () => {
    if (containerRef.current) {
      const bBox = containerRef.current.getBoundingClientRect();
      // 열리는 상황

      if (active) {
        // 좌로 넘치지 않을경우
        if (bBox.left - CONTENT_WIDTH + TOGGLE_WIDTH > 0) {
          containerRef.current.style.left = `${
            bBox.left - CONTENT_WIDTH + TOGGLE_WIDTH
          }px`;
        } else {
          setXReverse(true);
        }
        // 위로 넘치지 않을경우
        if (bBox.top - contentHeight + TOGGLE_HEIGHT > SAFETY_VALUE) {
          setYReverse(false);
          containerRef.current.style.top = `${
            bBox.top - contentHeight + TOGGLE_HEIGHT
          }px`;
        } else {
          setYReverse(true);
        }
      } else {
        // 닫히는 상황
        // 좌로 넘치지 않을경우
        if (!xReverse) {
          containerRef.current.style.left = `${
            bBox.left + CONTENT_WIDTH - TOGGLE_WIDTH
          }px`;
        } else {
          setXReverse(false);
        }
        if (!yReverse) {
          containerRef.current.style.top = `${
            bBox.top + contentHeight - TOGGLE_HEIGHT
          }px`;
          setYReverse(false);
        }
      }
    }
  };
  const handleMouseMove = (e: MouseEvent) => {
    // 현재 커서가 화면 내부에 있는지 확인
    if (containerRef.current) {
      const bBox = containerRef.current.getBoundingClientRect();
      const { clientX, clientY } = e;
      const width = bBox.width / 2;
      const height = bBox.height / 2;
      if (
        bBox.x > 0 &&
        bBox.x + TOGGLE_WIDTH < window.innerWidth &&
        bBox.y > 0 &&
        bBox.y + TOGGLE_HEIGHT < window.innerHeight
      ) {
        // MOVE_SAFETY 이상 이동하지 않으면 클릭으로 간주한다.
        if (startPosRef.current) {
          if (
            !(Math.abs(startPosRef.current.x - clientX) > MOVE_SAFETY) &&
            !(Math.abs(startPosRef.current.y - clientY) > MOVE_SAFETY)
          ) {
            return;
          }
        }
        if (grabRef.current) {
          setActive(false);
          setIsMoving(true);
          containerRef.current.style.left = `${clientX - width}px`;
          containerRef.current.style.top = `${clientY - height}px`;
          // localStorage 에 값기록
          localStorage.setItem('floatingLeft', `${clientX - width}`);
          localStorage.setItem('floatingTop', `${clientY - height}`);
        }
      } else {
        // 화면 밖으로 이동시키지 않는 로직
        setIsGrab(false);

        if (bBox.y <= 0) {
          containerRef.current.style.top = `${SAFETY_VALUE}px`;
        }
        if (bBox.y + TOGGLE_HEIGHT >= window.innerHeight) {
          containerRef.current.style.top = `calc(${window.innerHeight}px - ${
            TOGGLE_HEIGHT + SAFETY_VALUE
          }px`;
        }
        if (bBox.x <= 0) {
          containerRef.current.style.left = `${SAFETY_VALUE}px`;
        }
        if (bBox.x + TOGGLE_WIDTH >= window.innerWidth) {
          containerRef.current.style.left = `calc(${window.innerWidth}px - ${
            TOGGLE_WIDTH + SAFETY_VALUE
          }px`;
        }
      }
    }
  };
  const handleResize = () => {
    // 현재 커서가 화면 내부에 있는지 확인
    if (containerRef.current) {
      const bBox = containerRef.current.getBoundingClientRect();

      // 화면 내부에 있을경우
      if (
        bBox.x > 0 &&
        bBox.x + TOGGLE_WIDTH < window.innerWidth &&
        bBox.y > 0 &&
        bBox.y + TOGGLE_HEIGHT < window.innerHeight
      ) {
        return;
      }
      // 기존 위치 고정 로직
      const yPercent = Math.floor((bBox.top / window.innerHeight) * 100);
      const xPercent = Math.floor((bBox.left / window.innerWidth) * 100);
      containerRef.current.style.top = `${yPercent}%`;
      containerRef.current.style.left = `${xPercent}%`;
    }
  };

  // refactor

  const EXCEPTION: Array<string> = ['annotation'];

  const handlePid = () => {
    let trigger = true;

    EXCEPTION.forEach((v) => {
      if (window.location.pathname.includes(v)) trigger = false;
    });
    const split = location.pathname.split('/');

    if (split.includes('common')) return;

    if (trigger) {
      split.forEach((v) => {
        if (!Number.isNaN(Number(v))) setPid(Number(v));
      });
    } else {
      setPid(0);
    }
  };

  const handleVisible = () => {
    if (location.pathname.includes('projects/')) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };
  const handleActive = () => {
    setActive(false);
  };
  const handleAway = () => {
    setActive(false);
  };
  const handleJobCount = () => {
    if (data?.status) {
      setJobCount(data.result);
    }
  };
  const handleGrabRef = () => {
    grabRef.current = isGrab;
  };
  const handleContentHeight = () => {
    if (metaData?.result.workflow === 0) {
      setContentHeight(136);
    } else {
      setContentHeight(184);
    }
  };
  const onClickLabeling = async () => {
    if (!pid) return;
    if (jobCount.labelCount > 0)
      await moveToLabeling(pid, metaData?.result.type);
  };
  const onClickReview = async () => {
    if (!pid) return;
    if (jobCount.reviewCount > 0)
      await moveToReview(pid, metaData?.result.type);
  };
  const initialize = () => {
    // 기존 좌표를 가져와 적용한다.
    const x = localStorage.getItem('floatingLeft');
    const y = localStorage.getItem('floatingTop');
    if (containerRef.current) {
      if (x && y) {
        containerRef.current.style.left = `${Number(x)}px`;
        containerRef.current.style.top = `${Number(y)}px`;
      }
    }
  };
  useEffect(() => {
    handleJobCount();
  }, [data]);
  useEffect(() => {
    handleOpen();
  }, [active]);

  useEffect(() => {
    handleGrabRef();
  }, [isGrab]);
  useEffect(() => {
    handlePid();
    handleVisible();
    handleActive();
  }, [location]);
  useEffect(() => {
    handleContentHeight();
  }, [jobCount]);

  useLayoutEffect(() => {
    // 마우스 이동감지
    window.addEventListener('mousemove', handleMouseMove);
    const moveTicker = setTimeout(() => {
      initialize();
    }, 1000);
    // 화면 리사이징 감지
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      clearTimeout(moveTicker);
    };
  }, [window.location.pathname]);

  return (
    <Switch>
      <Case condition={!visible}>
        <></>
      </Case>
      <Case condition={!jobCount.labelCount && !jobCount.reviewCount}>
        <></>
      </Case>
      <Case condition={isMobile}>
        <></>
      </Case>
      <Default>
        <ClickAwayListener onClickAway={handleAway}>
          <div>
            <div
              className={cx(
                'container',
                active && 'active',
                isGrab && 'grab',
                metaData?.result.workflow === 0 && 'sm',
              )}
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            >
              <div
                className={cx(
                  'contents',
                  active && 'active',
                  yReverse && 'y-reverse',
                )}
              >
                <div className={cx('up-side')}>
                  {metaData?.result.workflow === 1 && (
                    <div
                      className={cx(
                        'btn-container',
                        jobCount.reviewCount === 0 && 'disabled',
                      )}
                      onClick={onClickReview}
                    >
                      <div className={cx('ico')}>
                        <TalkBoxIcon disabled={jobCount.reviewCount === 0} />
                      </div>
                      <div className={cx('title')}>
                        <Sypo
                          type='P1'
                          color={
                            jobCount.reviewCount === 0 ? DIM_COLOR : MONO201
                          }
                          weight='M'
                        >
                          {t(`component.toggleBtn.review`)}
                        </Sypo>
                      </div>
                    </div>
                  )}
                  <div
                    className={cx(
                      'btn-container',
                      jobCount.labelCount === 0 && 'disabled',
                    )}
                    onClick={onClickLabeling}
                  >
                    <div className={cx('ico')}>
                      <TagWhiteIcon disabled={jobCount.labelCount === 0} />
                    </div>
                    <div className={cx('title')}></div>
                    <Sypo
                      type='P1'
                      color={jobCount.labelCount === 0 ? DIM_COLOR : MONO201}
                      weight='M'
                    >
                      {t(`component.badge.labeling`)}
                    </Sypo>
                  </div>
                </div>
                <div className={cx('bottom-side')}>
                  <div className={cx('close-icon')} onClick={handleActive}>
                    <CloseGrayIcon />
                  </div>
                  <div className={cx('pencil-icon')}>
                    <MyWorkPencilIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ClickAwayListener>
      </Default>
    </Switch>
  );
};

export default FloatingCircle;
