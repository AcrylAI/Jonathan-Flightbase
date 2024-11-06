import React, { useState } from 'react';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import _ from 'lodash';

import SetAutoLabelModalAtom, {
  SetAutoLabelModalAtomModel,
} from '@src/stores/components/Modal/SetAutoLabelModalAtom';

import { Sypo } from '@src/components/atoms';
import CheckBox from '@src/components/atoms/Input/CheckBox/CheckBox';
import SetAutolabelingListContainer from '../listContainer/SetAutolabelingListContainer';
import AutoLabelingListItem from '../listItem/AutoLabelingListItem';

import { BLUE104, BLUE110 } from '@src/utils/color';

import styles from './SetAutoLabelingSelectedModelClass.module.scss';
import classNames from 'classnames/bind';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

type Props = {
  name: string;
  checked: boolean;
  onClickCheckbox: (v: string) => void;
};
const ListItem = ({ name, checked, onClickCheckbox }: Props) => {
  const [modalState, setModalState] =
    useRecoilState<SetAutoLabelModalAtomModel>(SetAutoLabelModalAtom);
  const getCurTool = () => {
    const fIdx = modalState.autolabelingList.findIndex(
      (v) => v.id === modalState.selectedModel,
    );
    if (fIdx > -1) return modalState.autolabelingList[fIdx].type;
    return undefined;
  };
  return (
    <div className={cx('list-item-container')}>
      <div className={cx('left-side')}>
        <div className={cx('check')}>
          <CheckBox
            checked={checked}
            onChange={(e) => {
              onClickCheckbox(name);
            }}
          />
        </div>
        <div className={cx('tool')}>
          <AutoLabelingListItem.Tool
            size='sm'
            type={getCurTool()}
            selected={checked}
          />
        </div>
        <div className={cx('name')}>
          <Sypo type='P1' weight='R' color={checked ? BLUE104 : BLUE110}>
            {name}
          </Sypo>
        </div>
      </div>
      <div className={cx('right-side')}></div>
    </div>
  );
};

type DimType = {
  title: string;
  desc: Array<string>;
};

const SetAutoLabelingSelectedModelClass = () => {
  const { t } = useT();
  const [modalState, setModalState] =
    useRecoilState<SetAutoLabelModalAtomModel>(SetAutoLabelModalAtom);
  const [filteredList, setFilteredList] = useState<Array<string>>([]);
  const [dim, setDim] = useState<DimType | undefined>();

  const checkSelected = (name: string) => {
    return modalState.selectedModelClass.includes(name);
  };
  const handleDim = () => {
    const errorModel: DimType = {
      title: `${t(`modal.setAutolabeling.modelErrorTitle`)}`,
      desc: [
        `${t(`modal.setAutolabeling.modelErrorDesc1`)}`,
        `${t(`modal.setAutolabeling.modelErrorDesc2`)}`,
      ],
    };
    const unavailableModel: DimType = {
      title: `${t(`modal.setAutolabeling.unavailableModelTitle`)}`,
      desc: [
        `${t(`modal.setAutolabeling.unavailableModelDesc1`)}`,
        `${t(`modal.setAutolabeling.unavailableModelDesc2`)}`,
      ],
    };
    const temp = _.cloneDeep(modalState);
    const fIdx = temp.autolabelingList.findIndex(
      (v) => v.id === temp.selectedModel,
    );
    if (fIdx !== -1) {
      const item = temp.autolabelingList[fIdx];
      // item type 이 0 인경우는 모델의 타입을 확인 할 수 없는경우
      if (!item.type) {
        setDim(errorModel);
      } else if (!temp.projectTools.includes(item.type)) {
        setDim(unavailableModel);
      } else {
        setDim(undefined);
      }
    }
  };

  const onClickListItem = (name: string) => {
    const temp = _.cloneDeep(modalState);
    const fIdx = temp.selectedModelClass.findIndex((v) => v === name);
    if (fIdx === -1) {
      temp.selectedModelClass.push(name);
    } else {
      temp.selectedModelClass.splice(fIdx, 1);
    }
    setModalState(temp);
  };
  const onChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const temp = _.cloneDeep(modalState);
    temp.modelClassSearch = e.target.value;
    setModalState(temp);
  };

  const onChangeModel = () => {
    setFilteredList(modalState.modelClassList);
  };
  const handleFiltering = () => {
    let list = _.cloneDeep(modalState.modelClassList);
    if (modalState.modelClassSearch) {
      list = modalState.modelClassList.filter((v) =>
        v.includes(modalState.modelClassSearch),
      );
      list.sort();
    }
    setFilteredList(list);
  };
  useEffect(() => {
    handleDim();
  }, [modalState.selectedModel]);

  useEffect(() => {
    onChangeModel();
  }, [modalState.modelClassList]);

  useEffect(() => {
    handleFiltering();
  }, [modalState.modelClassSearch, modalState.modelClassList]);

  return (
    <SetAutolabelingListContainer
      title={`${t(`modal.setAutolabeling.selectClassesInModel`)} (${
        modalState.selectedModelClass.length
      })`}
      dim={dim}
      search
      searchValue={modalState.modelClassSearch}
      placeholder={`${t(`modal.setAutolabeling.enterClass`)}`}
      nodataDesc={
        !modalState.selectedModel && modalState.selectedModelClass.length === 0
          ? `${t(`modal.setAutolabeling.noClassesInModel`)}`
          : ''
      }
      searchDisabled={modalState.selectedModel === 0}
      onChangeSearch={onChangeSearch}
    >
      <>
        {filteredList.map((v, idx) => (
          <AutoLabelingListItem.Container
            key={`selected-class-item ${idx}`}
            selected={checkSelected(v)}
            onClick={() => onClickListItem(v)}
            leftSide={
              <ListItem
                name={v}
                checked={checkSelected(v)}
                onClickCheckbox={onClickListItem}
              />
            }
          />
        ))}
      </>
    </SetAutolabelingListContainer>
  );
};

export default SetAutoLabelingSelectedModelClass;
