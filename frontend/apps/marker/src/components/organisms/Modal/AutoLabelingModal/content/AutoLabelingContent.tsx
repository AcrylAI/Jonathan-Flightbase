import { useState } from 'react';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import RunAutoLabelModalAtom, {
  RunAutoLabelClassType,
  RunAutoLabelModalAtomModel,
  RunAutoLabelModelType,
} from '@src/stores/components/Modal/RunAutoLabelModalAtom';

import { Mypo, Sypo } from '@src/components/atoms';

import {
  BLUE104,
  BLUE109,
  BLUE110,
  MONO205,
  MONO206,
  RED502,
  RED503,
} from '@src/utils/color';

import AutoLabelBillBoard from './billboard/AutoLabelBillBoard';
import AutoLabelDataType from './dataType/AutoLabelDataType';
import SetAutolabelingListContainer from './listContainer/SetAutolabelingListContainer';
import AutoLabelingListItem from './listItem/AutoLabelingListItem';

import { WarningTriangleIcon } from '@src/static/images';

import styles from './AutoLabelingContent.module.scss';
import classNames from 'classnames/bind';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

type ModelListProps = {
  onClick: (id: number) => void;
  item: RunAutoLabelModelType;
  selected: boolean;
};

const ModelListItem = ({ selected, item, onClick }: ModelListProps) => {
  return (
    <AutoLabelingListItem.Container
      selected={selected}
      onClick={() => onClick(item.id)}
      rightSide={
        !item.active ? (
          <img
            src={WarningTriangleIcon}
            alt='warning'
            style={{ marginRight: '2px' }}
          />
        ) : (
          <AutoLabelingListItem.Tool type={item.type} selected={selected} />
        )
      }
      leftSide={
        <div className={cx('label-container')}>
          <div className={cx('model')}>
            <Sypo type='P2' weight='R' color={selected ? BLUE104 : MONO205}>
              {item.model}
            </Sypo>
          </div>
          <div className={cx('deploy')}>
            <Sypo type='P1' weight='R' color={selected ? BLUE104 : BLUE110}>
              {item.deploy}
            </Sypo>
          </div>
        </div>
      }
    />
  );
};

type ClassItemProps = {
  item: RunAutoLabelClassType;
};

const ClassListItem = ({ item }: ClassItemProps) => {
  const { t } = useT();
  return (
    <AutoLabelingListItem.Container
      customStyle={{ cursor: 'default' }}
      leftSide={
        <div className={cx('class-item-container')}>
          <div className={cx('color')}>
            <AutoLabelingListItem.ColorChip color={item.color} />
          </div>
          <div className={cx('tool')}>
            <AutoLabelingListItem.Tool
              size='sm'
              type={item.tool}
              selected={false}
            />
          </div>
          <div className={cx('class')}>
            <Sypo type='P1' weight='R' color={BLUE110}>
              {item.name}
            </Sypo>
          </div>
        </div>
      }
    />
  );
};
const ErrorLayer = () => {
  const { t } = useT();
  return (
    <div className={cx('error-layer')}>
      <div className={cx('title')}>
        <Sypo type='H3' weight='M' color={RED503}>
          {t(`modal.runAutolabeling.inactiveModel`)}
        </Sypo>
      </div>
      <div className={cx('desc')}>
        <Mypo type='P1' weight='R' color={BLUE110}>
          <p>{t(`modal.runAutolabeling.inactiveDesc1`)}</p>
          <p>{t(`modal.runAutolabeling.inactiveDesc2`)}</p>
          <p>{t(`modal.runAutolabeling.inactiveDesc3`)}</p>
          <p>{t(`modal.runAutolabeling.inactiveDesc4`)}</p>
          <p>{t(`modal.runAutolabeling.inactiveDesc5`)}</p>
          <p>{t(`modal.runAutolabeling.inactiveDesc6`)}</p>
        </Mypo>
      </div>
    </div>
  );
};

const AutoLabelingContent = () => {
  const { t } = useT();
  const [modalState, setModalState] =
    useRecoilState<RunAutoLabelModalAtomModel>(RunAutoLabelModalAtom);
  const [filteredList, setFilteredList] = useState<
    Array<RunAutoLabelClassType>
  >([]);
  const checkModelSelected = (id: number) => {
    return modalState.selectedModel === id;
  };
  const onClickModelItem = (id: number) => {
    const temp = _.cloneDeep(modalState);
    temp.selectedModel = id;
    setModalState(temp);
  };
  const handleClassList = () => {
    let list = _.cloneDeep(modalState.classList);
    if (modalState.selectedModel) {
      list = modalState.classList.filter(
        (v) => v.modelId === modalState.selectedModel,
      );
    }

    setFilteredList(list);
  };
  const checkInactiveModel = (): boolean => {
    let result = false;
    // inactive 된 것 이 있을때
    if (modalState.modelList.findIndex((v) => v.active === 0) !== -1) {
      result = true;
    }

    return result;
  };
  const checkCurInactiveModel = (): boolean => {
    let result = false;
    // 선택한 모델이 inactive 일때
    const fIdx = modalState.modelList.findIndex(
      (v) => v.id === modalState.selectedModel,
    );
    if (fIdx !== -1 && modalState.modelList[fIdx].active === 0) result = true;
    return result;
  };

  useEffect(() => {
    handleClassList();
  }, [modalState.selectedModel, modalState.classList]);
  return (
    <div className={cx('auto-content-container')}>
      <div className={cx('contents')}>
        <div className={cx('left-section')}>
          <AutoLabelDataType type='type' />
          <AutoLabelBillBoard type='auto' />
          <SetAutolabelingListContainer
            loading={modalState.isLoading}
            title={`${t(`modal.runAutolabeling.modelToUse`)}`}
            height='75%'
            nodataDesc={
              !modalState.isLoading && modalState.modelList.length === 0
                ? `${t(`modal.runAutolabeling.noModels`)}`
                : ''
            }
          >
            <>
              {modalState.modelList.map((v, idx) => (
                <ModelListItem
                  key={`model-list-item ${idx}`}
                  selected={checkModelSelected(v.id)}
                  item={v}
                  onClick={onClickModelItem}
                />
              ))}
            </>
          </SetAutolabelingListContainer>
        </div>
        <div className={cx('right-section')}>
          <AutoLabelDataType type='keep' />
          <AutoLabelBillBoard type='keep' />
          <SetAutolabelingListContainer
            height='75%'
            title={`${t(`modal.runAutolabeling.class`)}`}
          >
            <>
              {checkCurInactiveModel() && <ErrorLayer />}
              {filteredList.map((v, idx) => (
                <ClassListItem key={`class-item ${idx}`} item={v} />
              ))}
            </>
          </SetAutolabelingListContainer>
        </div>
      </div>
      {checkInactiveModel() && (
        <div className={cx('error-msg')}>
          <Sypo type='P1' weight='R' color={RED502}>
            {t(`modal.runAutolabeling.inactiveLabel`)}
          </Sypo>
        </div>
      )}
    </div>
  );
};

export default AutoLabelingContent;
