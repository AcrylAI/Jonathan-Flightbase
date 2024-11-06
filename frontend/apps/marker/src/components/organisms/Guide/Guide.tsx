import { useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import _ from 'lodash';

import GuideAtom, {
  GuideAtomModel,
  GuideModel,
} from '@src/stores/components/Guide/GuideAtom';

import GuideContainer from './Container/GuideContainer';
import GuideDesc from './Desc/GuideDesc';
import GuideListSwiper from './ListSwiper/GuideListSwiper';
import GuideVideoContainer from './VideoContainer/GuideVideoContainer';

type Props = {
  guideList: Array<GuideModel>;
};
const Guide = ({ guideList }: Props) => {
  const [guideState, setGuideState] = useRecoilState<GuideAtomModel>(GuideAtom);
  const reset = useResetRecoilState(GuideAtom);

  const setGuideList = () => {
    const temp = _.cloneDeep(guideState);
    temp.guideList = guideList;
    setGuideState(temp);
  };
  const initialize = () => {
    setGuideList();
  };
  useEffect(() => {
    initialize();
    return () => {
      reset();
    };
  }, []);
  return (
    <GuideContainer>
      <>
        <GuideListSwiper />
        <GuideVideoContainer />
        <GuideDesc />
      </>
    </GuideContainer>
  );
};

export default Guide;
