import { useRecoilState } from 'recoil';
import _ from 'lodash';

import RunAutoLabelModalAtom, {
  RunAutoLabelModalAtomModel,
} from '@src/stores/components/Modal/RunAutoLabelModalAtom';

import { Sypo } from '@src/components/atoms';
import Radio from '@src/components/atoms/Input/Radio/Radio';

import { BLUE110, MONO205, MONO208 } from '@src/utils/color';

import styles from './AutoLabelDataType.module.scss';
import classNames from 'classnames/bind';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

type Props = {
  type: 'type' | 'keep';
};

const AutoLabelDataType = ({ type }: Props) => {
  const { t } = useT();
  const [modalState, setModalState] =
    useRecoilState<RunAutoLabelModalAtomModel>(RunAutoLabelModalAtom);
  const handleCheck = () => {
    const temp = _.cloneDeep(modalState);
    if (type === 'type') {
      temp.dataType = temp.dataType === 1 ? 0 : 1;
      temp.dataCnt =
        temp.dataType === 1 ? temp.data.overall : temp.data.unworked;
    } else {
      temp.keepDataType = temp.keepDataType === 1 ? 0 : 1;
    }
    setModalState(temp);
  };

  return (
    <div className={cx('data-type-container')}>
      <div className={cx('desc')}>
        <Sypo type='P1' color={BLUE110}>
          {type === 'type'
            ? `${t(`modal.runAutolabeling.dataType`)}`
            : `${t(`modal.runAutolabeling.keepData`)}`}
        </Sypo>
        <span className={cx('ico')}></span>
      </div>
      <div className={cx('checkbox-group')}>
        <Radio
          label={
            type === 'type'
              ? `${t(`modal.runAutolabeling.Unworked`)}`
              : `${t(`modal.runAutolabeling.keep`)}`
          }
          customLabelStyle={{ common: { color: MONO208 } }}
          selected={
            type === 'type'
              ? modalState.dataType === 0
              : modalState.keepDataType === 0
          }
          onChange={(e) => handleCheck()}
        />
        <Radio
          label={
            type === 'type'
              ? `${t(`modal.runAutolabeling.Overall`)}`
              : `${t(`modal.runAutolabeling.delete`)}`
          }
          customLabelStyle={{ common: { color: MONO208 } }}
          selected={
            type === 'type'
              ? modalState.dataType === 1
              : modalState.keepDataType === 1
          }
          onChange={(e) => handleCheck()}
        />
      </div>
    </div>
  );
};

export default AutoLabelDataType;
