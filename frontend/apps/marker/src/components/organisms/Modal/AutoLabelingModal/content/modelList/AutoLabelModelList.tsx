import { useRecoilState } from 'recoil';
import _ from 'lodash';

import {
  AutoLabelModalAtom,
  AutoLabelModalAtomModel,
} from '@src/stores/components/Modal/SetAutoLabelModalAtom';

import { Sypo } from '@src/components/atoms';
import AutoLabellingDesc from '../description/AutoLabellingDesc';

import AutoLabelModelListItem from './modelListItem/AutoLabelModelListItem';

import styles from './AutoLabelModelList.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const AutoLabelModelList = () => {
  const [modalState, setModalState] =
    useRecoilState<AutoLabelModalAtomModel>(AutoLabelModalAtom);
  const onChangeSelected = (idx: number) => {
    const temp = _.cloneDeep(modalState);
    temp.selectedId = idx;
    setModalState(temp);
  };
  return (
    <div className={cx('model-container')}>
      <div className={cx('title')}>
        <Sypo type='P1'>Select Autolabeling Model</Sypo>
      </div>
      <div className={cx('list-container')}>
        <div className={cx('header')}>
          <div className={cx('select')}>
            <Sypo type='P1'>Select</Sypo>
          </div>
          <div className={cx('model')}>
            <Sypo type='P1'>Model</Sypo>
          </div>
          <div className={cx('d-name')}>
            <Sypo type='P1'>Deployment Name</Sypo>
          </div>
          <div className={cx('d-owner')}>
            <Sypo type='P1'>Deployment Owner</Sypo>
          </div>
          <div className={cx('resource')}>
            <Sypo type='P1'>Resource</Sypo>
          </div>
        </div>
        <div className={cx('list')}>
          {modalState.autolabelingList.map((v, idx) => (
            <div
              key={`list-item-container ${idx}`}
              className={cx('list-item-container')}
            >
              <AutoLabelModelListItem
                selected={modalState.selectedId === v.id}
                setSelected={onChangeSelected}
                item={v}
              />
            </div>
          ))}
        </div>
      </div>
      <AutoLabellingDesc />
    </div>
  );
};

export default AutoLabelModelList;
