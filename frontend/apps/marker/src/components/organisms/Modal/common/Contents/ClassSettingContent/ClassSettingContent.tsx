import { RefObject, useState } from 'react';
import { useRecoilValue } from 'recoil';
import _ from 'lodash';

import {
  ProjectModalAtom,
  ProjectModalAtomModel,
  ProjectModalClassItemModel,
  ProjectModalPropModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import { Sypo } from '@src/components/atoms';

import { CLASS_COLOR_SET } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import ClassSettingClassList from './ClassList/ClassSettingClassList';
import ClassSettingPropertyList from './PropertyList/ClassSettingPropertyList';

import styles from './ClassSettingContent.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

export type ClassSettingContentProps = {
  classList: Array<ProjectModalClassItemModel>;
  toolList: Array<number>;
  edit?: boolean;
  onChangeClassList: (list: Array<ProjectModalClassItemModel>) => void;
};

const ClassSettingContent = ({
  edit,
  classList,
  toolList,
  onChangeClassList,
}: ClassSettingContentProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const modalState = useRecoilValue<ProjectModalAtomModel>(ProjectModalAtom);
  const modal = useModal();
  const { t } = useT();

  const getIsFullScreen = () => {
    let result = false;
    const fIdx = modal.modalList.findIndex((v) => v.isFullScreen);
    if (fIdx !== -1) result = true;
    return result;
  };
  const handleSelectedIdx = (idx: number) => {
    setSelectedIdx(idx);
  };

  // handle functions
  const handleAddClass = () => {
    const colorIdx =
      classList.length > 14 ? classList.length - 15 : classList.length;
    const color = CLASS_COLOR_SET[colorIdx];
    const tool = toolList[0];
    const newClass: ProjectModalClassItemModel = {
      color,
      name: '',
      tool,
      props: [],
    };
    if (edit) {
      newClass.id = 0;
      newClass.deleted = 0;
    }

    const temp = [...classList, newClass];
    onChangeClassList(temp);
  };

  const handleAddProperty = () => {
    if (classList.length > selectedIdx) {
      const temp = _.cloneDeep(classList);

      // new object
      const newProps: ProjectModalPropModel = {
        title: '',
        selectType: 0,
        required: 1,
        options: [],
      };
      if (edit) {
        newProps.id = 0;
        newProps.deleted = 0;
      }

      temp[selectedIdx].props.push(newProps);
      onChangeClassList(temp);
    }
  };

  const handleChangeClassList = (list: Array<ProjectModalClassItemModel>) => {
    onChangeClassList(list);
  };

  const handleChangeProps = (list: Array<ProjectModalPropModel>) => {
    const temp = _.cloneDeep(classList);
    temp[selectedIdx].props = list;
    onChangeClassList(temp);
  };

  const propValidation = (): boolean => {
    if (classList.length === 0 || classList[selectedIdx].deleted === 1) {
      return false;
    }
    return true;
  };

  return (
    <div
      className={cx(
        'class-setting-container',
        getIsFullScreen() && 'fullscreen',
      )}
    >
      {modalState.default.dataType === 1 && (
        <div className={cx('blind')}>
          <div className={cx('blind-text')}>
            <Sypo type='h4' weight={500}>
              {t(`modal.newProject.noNeedTools`)}
            </Sypo>
          </div>
        </div>
      )}

      <ClassSettingClassList
        edit={edit}
        list={classList}
        toolList={toolList}
        selected={selectedIdx}
        onClickAdd={handleAddClass}
        setSelected={handleSelectedIdx}
        onChangeList={handleChangeClassList}
      />
      <ClassSettingPropertyList
        edit={edit}
        list={!propValidation() ? [] : classList[selectedIdx].props}
        disabled={!propValidation()}
        className={!propValidation() ? '' : classList[selectedIdx].name}
        onClickAdd={handleAddProperty}
        onChangeList={handleChangeProps}
      />
    </div>
  );
};

ClassSettingContent.defaultProps = {
  edit: false,
};

export default ClassSettingContent;
