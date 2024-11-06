import { useEffect, useRef, useState } from 'react';

import style from './AppendCardSkeleton.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  windowSize: {
    width: number;
  };
};

function AppendCardSkeleton({ windowSize }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [barArr, setBarArr] = useState<Array<number>>([]);

  useEffect(() => {
    // 대형 노트북
    if (windowSize.width === 1440) {
      setBarArr([130, 70, 50, 120, 70, 40, 70, 60, 80, 129, 110, 80]);
      return;
    }
    // 소형 노트북
    if (windowSize.width === 1024) {
      setBarArr([130, 70, 50, 120, 70, 40, 70, 60]);
      return;
    }
    // 아이패드
    if (windowSize.width === 820) {
      setBarArr([130, 70, 50, 120, 70, 40, 70]);
      return;
    }
    // 아이패드 미니
    if (windowSize.width === 768) {
      setBarArr([130, 70, 50, 120, 70, 40]);
      return;
    }

    // 그 외 반응형
    const container = containerRef.current;
    if (!container) return;

    const baseArr = [
      130, 70, 50, 120, 70, 40, 70, 60, 80, 129, 110, 80, 120, 92, 76, 103, 52,
      64, 123, 60, 130, 70, 50, 120, 70, 40, 70, 60, 80, 129, 110, 80, 120, 92,
      76, 103, 52, 64, 123, 60, 130, 70, 50, 120, 70, 40, 70, 60, 80, 129, 110,
      80, 120, 92, 76, 103, 52, 64, 123, 60,
    ];
    const newArr: Array<number> = [];

    const width = container.offsetWidth - 349;
    const len = width / 60;
    let iter = 0;
    for (let i = 0; i < len - 2; i++) {
      newArr.push(baseArr[iter]);
      iter++;
      if (baseArr.length <= iter) {
        iter = 0;
      }
    }
    setBarArr(newArr);
  }, [windowSize]);

  return (
    <div className={cx('container')} ref={containerRef}>
      <div className={cx('left')}>
        <div className={cx('label-skeleton')}></div>
        <div className={cx('graph-skeleton')}>
          <div className={cx('graph-body')}>
            <div className={cx('center-hole')}>
              <div className={cx('top-box')}></div>
              <div className={cx('bottom-box')}></div>
            </div>
          </div>
          <div className={cx('graph-legend')}>
            {[0, 0, 0, 0, 0, 0].map((_, index) => {
              return <div key={index}></div>;
            })}
          </div>
        </div>
      </div>
      <div className={cx('right')} ref={barRef}>
        <div className={cx('label-skeleton')}></div>
        <div className={cx('graph-skeleton')}>
          {barArr.map((height, idx) => {
            return (
              <div
                key={idx}
                style={{
                  height: `${height}px`,
                }}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AppendCardSkeleton;
