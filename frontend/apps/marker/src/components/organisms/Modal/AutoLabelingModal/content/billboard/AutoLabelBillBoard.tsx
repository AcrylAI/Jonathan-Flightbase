import { useRecoilState } from 'recoil';

import { Case, Default, Switch } from '@jonathan/react-utils';

import RunAutoLabelModalAtom, {
  RunAutoLabelModalAtomModel,
} from '@src/stores/components/Modal/RunAutoLabelModalAtom';

import { Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import styles from './AutoLabelBillBoard.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  type: 'auto' | 'keep';
};
const AutoLabelBillBoard = ({ type }: Props) => {
  const { t } = useT();
  const [modalState, setModalState] =
    useRecoilState<RunAutoLabelModalAtomModel>(RunAutoLabelModalAtom);
  return (
    <div className={cx('billboard-container')}>
      <span className={cx('value')}>
        <Sypo type='P1' weight='bold'>
          <Switch>
            <Case
              condition={type === 'auto'}
            >{`${modalState.dataCnt.toLocaleString('kr')}`}</Case>
            <Default>{`${modalState.keepData.toLocaleString('kr')}`}</Default>
          </Switch>
        </Sypo>
      </span>
      <span className={cx('desc')}>
        <Sypo type='P1' weight='R'>
          <Switch>
            <Case condition={type === 'auto'}>
              {t(`modal.runAutolabeling.autoDesc`)}
            </Case>
            <Default>
              {modalState.keepDataType === 0
                ? `${t(`modal.runAutolabeling.willBeKeep`)}`
                : `${t(`modal.runAutolabeling.willBeDelete`)}`}
            </Default>
          </Switch>
        </Sypo>
      </span>
    </div>
  );
};

export default AutoLabelBillBoard;
