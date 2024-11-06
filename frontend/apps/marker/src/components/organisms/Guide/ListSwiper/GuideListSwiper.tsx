import { useRecoilState } from 'recoil';

import GuideAtom, {
  GuideAtomModel,
} from '@src/stores/components/Guide/GuideAtom';

import { Sypo } from '@src/components/atoms';

import { PlayCircleIcon } from '@src/static/images';

import styles from './GuideListSwiper.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const GuideListSwiper = () => {
  const [guideState, setGuideState] = useRecoilState<GuideAtomModel>(GuideAtom);
  return (
    <div className={cx('swiper-container')}>
      <div className={cx('control', 'prev')}>
        <div className={cx('arrow')}>
          <Sypo type='P2' weight='B'>
            {`<`}
          </Sypo>
        </div>
      </div>

      <div className={cx('contents')}>
        {guideState.guideList.map((v, idx) => (
          <div
            key={`swiper-item-${idx}`}
            className={cx('preview', guideState.curIdx === idx && 'selected')}
            style={
              v.thumbnail ? { backgroundImage: `url(${v.thumbnail})` } : {}
            }
          >
            {idx !== guideState.curIdx && (
              <>
                <div className={cx('title')}>
                  <Sypo type='P4' weight='M'>
                    {v.title}
                  </Sypo>
                </div>
                <div className={cx('shadow')}></div>
                <div className={cx('play')}>
                  <img src={PlayCircleIcon} alt='play' />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className={cx('control', 'next')}>
        <div className={cx('arrow')}>
          <Sypo type='P2' weight='B'>
            {`>`}
          </Sypo>
        </div>
      </div>
    </div>
  );
};

export default GuideListSwiper;
