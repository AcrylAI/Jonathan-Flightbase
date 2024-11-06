import styles from './GuideDesc.module.scss';
import classNames from 'classnames/bind';
import GuideAtom, {
  GuideAtomModel,
} from '@src/stores/components/Guide/GuideAtom';
import { useRecoilState } from 'recoil';
import { Mypo, Sypo } from '@src/components/atoms';

const cx = classNames.bind(styles);

const GuideDesc = () => {
  const [guideState, setGuideState] = useRecoilState<GuideAtomModel>(GuideAtom);

  return (
    <div className={cx('desc-container')}>
      <div className={cx('title')}>
        <Sypo type='H4' weight='M'>
          {guideState.curIdx + 1}.{' '}
          {guideState.guideList.length > 0
            ? guideState.guideList[guideState.curIdx].title
            : ''}
        </Sypo>
      </div>
      <div className={cx('desc')}>
        <Mypo type='P1' weight='R'>
          {guideState.guideList.length > 0
            ? guideState.guideList[guideState.curIdx].desc
            : ''}
        </Mypo>
      </div>
    </div>
  );
};

export default GuideDesc;
