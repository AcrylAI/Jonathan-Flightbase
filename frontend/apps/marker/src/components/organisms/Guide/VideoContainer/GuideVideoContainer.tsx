import styles from './GuideVideoContainer.module.scss';
import classNames from 'classnames/bind';
import GuideAtom, {
  GuideAtomModel,
} from '@src/stores/components/Guide/GuideAtom';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import { useEffect } from 'react';

const cx = classNames.bind(styles);

const GuideVideoContainer = () => {
  const [guideState, setGuideState] = useRecoilState<GuideAtomModel>(GuideAtom);

  return (
    <div className={cx('video-container')}>
      <video
        controls
        src={
          guideState.guideList.length > 0
            ? guideState.guideList[guideState.curIdx].video
            : ''
        }
        width={460}
        height={300}
      />

      {/*
      <video
        src='http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        width={400}
        height={225}
        controls
      />
  */}
    </div>
  );
};

export default GuideVideoContainer;
