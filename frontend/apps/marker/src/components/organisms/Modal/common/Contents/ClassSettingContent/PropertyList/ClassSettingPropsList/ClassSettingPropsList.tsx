import styles from './ClassSettingPropsList.module.scss';
import classNames from 'classnames/bind';
import ClassSettingPropsListItem from './ClassSettingPropsListItem/ClassSettingPropsListItem';
import { ProjectModalPropModel } from '@src/stores/components/Modal/ProjectModalAtom';
import React from 'react';
import _ from 'lodash';

const cx = classNames.bind(styles);

type ClassSettingPropsListProps = {
  list: Array<ProjectModalPropModel>;
  edit?: boolean;
  onChangePropsList: (list: Array<ProjectModalPropModel>) => void;
};
const ClassSettingPropsList = ({
  list,
  edit,
  onChangePropsList,
}: ClassSettingPropsListProps) => {
  const isDuplicated = (item: ProjectModalPropModel): boolean => {
    const fIdx = list.findIndex(
      (v) => v !== item && v.title.trim() === item.title.trim(),
    );
    return fIdx !== -1 || item.title.length === 0;
  };
  const handleChangeItem = (idx: number, item: ProjectModalPropModel) => {
    const temp = _.cloneDeep(list);
    temp[idx] = item;
    onChangePropsList(temp);
  };

  const handleDelete = (idx: number) => {
    const temp = _.cloneDeep(list);
    if (edit && list[idx].id) {
      // props
      temp[idx].deleted = 1;
      // options
      temp[idx].options.forEach((_, oIdx) => {
        temp[idx].options[oIdx].deleted = 1;
      });
    } else {
      temp.splice(idx, 1);
    }
    onChangePropsList(temp);
  };

  return (
    <div className={cx('props-list-container')}>
      {list.map((item, idx) => (
        <React.Fragment key={` props-list-container ${idx}`}>
          <ClassSettingPropsListItem
            idx={idx}
            item={item}
            edit={edit}
            duplicated={isDuplicated(item)}
            onChangeItem={handleChangeItem}
            onClickDelete={handleDelete}
          />
        </React.Fragment>
      ))}
    </div>
  );
};
ClassSettingPropsList.defaultProps = {
  edit: false,
};

export default ClassSettingPropsList;
