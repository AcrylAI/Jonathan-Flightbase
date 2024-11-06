import React, { RefObject, useRef } from 'react';
import { useState } from 'react';
import _ from 'lodash';

import { ListType } from '@jonathan/ui-react/src/components/molecules/Selectbox/types';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { ProjectModalClassItemModel } from '@src/stores/components/Modal/ProjectModalAtom';

import ClassSettingContainer, {
  ClassSettingContainerProps,
} from '../Container/ClassSettingContainer';
import ClassSettingNodata from '../Nodata/ClassSettingNodata';

import useT from '@src/hooks/Locale/useT';

import ClassSettingClassListItem from './ClssSettingClassListItem/ClassSettingClassListItem';

import styles from './ClassSettingClassList.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type ClassSettingClassListProps = {
  edit?: boolean;
  list: Array<ProjectModalClassItemModel>;
  toolList: Array<number>;
  selected: number;
  setSelected: (idx: number) => void;
  onClickAdd: () => void;
  onChangeList: (list: Array<ProjectModalClassItemModel>) => void;
};

const ClassSettingClassList = ({
  edit,
  list,
  toolList,
  selected,
  setSelected,
  onClickAdd,
  onChangeList,
}: ClassSettingClassListProps) => {
  const { t } = useT();
  const CLASS_TOOL_STR: Array<string> = [
    `${t(`modal.newProject.boundingBox`)}`,
    `${t(`modal.newProject.polygon`)}`,
    'NER',
  ];
  const [colorIndex, setColorIndex] = useState<number>(-1);
  const ClassContainerData: ClassSettingContainerProps = {
    title: `${t(`modal.newProject.class`)}`,
    buttonTitle: `${t(`modal.newProject.addClass`)}`,
    onClick: () => {},
    disabled: false,
  };
  const SelectListItem = () => {
    const selectList: Array<ListType> = [];
    toolList.forEach((tool) => {
      const item: ListType = {
        label: CLASS_TOOL_STR[tool - 1],
        value: tool,
      };
      selectList.push(item);
    });
    return selectList;
  };
  const isDuplicated = (item: ProjectModalClassItemModel): boolean => {
    const fIdx = list.findIndex((v) => {
      if (v !== item) {
        return v.name.trim() === item.name.trim() && v.tool === item.tool;
      }
      // 빈 문자열인지 체크
      if (v.name.length === 0) return true;
      return false;
    });
    return fIdx !== -1;
  };
  const onChangeItem = (idx: number, item: ProjectModalClassItemModel) => {
    const temp = _.cloneDeep(list);
    temp[idx] = item;
    onChangeList(temp);
  };
  const onChangeColor = (color: string, idx: number) => {
    const temp = _.cloneDeep(list);
    temp[idx].color = color;
    onChangeList(temp);
  };
  const onChangeColorIndex = (idx: number) => {
    setColorIndex(idx);
  };

  const onClickDelete = (idx: number) => {
    const temp = _.cloneDeep(list);
    // 수정 모드이고, id 가 있을경우
    if (edit && list[idx].id) {
      // class
      temp[idx].deleted = 1;
      // props
      temp[idx].props.forEach((prop, pIdx) => {
        temp[idx].props[pIdx].deleted = 1;
        // option
        prop.options.forEach((_, oIdx) => {
          temp[idx].props[pIdx].options[oIdx].deleted = 1;
        });
      });
    } else {
      setSelected(0);
      temp.splice(idx, 1);
    }
    onChangeList(temp);
  };

  const onClickList = (idx: number) => {
    setSelected(idx);
  };

  return (
    <ClassSettingContainer {...ClassContainerData} onClick={onClickAdd}>
      <Switch>
        <Case condition={list.length > 0}>
          <div className={cx('class-list-container')}>
            {list.map((v, idx) => (
              <React.Fragment key={`class-list-item ${idx}`}>
                <ClassSettingClassListItem
                  item={v}
                  index={idx}
                  colorIndex={colorIndex}
                  selected={selected}
                  setColor={onChangeColor}
                  duplicated={isDuplicated(v)}
                  setColorIndex={onChangeColorIndex}
                  onClickList={onClickList}
                  onChangeItem={onChangeItem}
                  onClickDelete={onClickDelete}
                  selectItemList={SelectListItem()}
                />
              </React.Fragment>
            ))}
          </div>
        </Case>
        <Default>
          <ClassSettingNodata desc={t(`modal.editClasses.emptyClasses`)} />
        </Default>
      </Switch>
    </ClassSettingContainer>
  );
};
ClassSettingClassList.defaultProps = { edit: false };

export default ClassSettingClassList;
