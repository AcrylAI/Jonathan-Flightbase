import React from 'react';
import _ from 'lodash';

import {
  ProjectModalDatasetModel,
  ProjectModalDatasetPathModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import DataSetListContainer from './DataSetListContainer/DataSetListContainer';
import DataSetListItem from './DataSetListItem/DataSetListItem';

import styles from './ConnectDataSetList.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type ConnectDataSetListProps = {
  data: ProjectModalDatasetModel;
  loading: boolean;
  onChangeData: (data: ProjectModalDatasetModel) => void;
};
const ConnectDataSetList = ({
  data,
  loading,
  onChangeData,
}: ConnectDataSetListProps) => {
  const handleChangePath = (
    path: string,
    viewPath: string,
    fileCount: number,
  ) => {
    const temp = _.cloneDeep(data);
    temp.selectedPath = path;
    temp.viewPath = viewPath;
    temp.fileCount = fileCount;
    onChangeData(temp);
  };
  return (
    <DataSetListContainer loading={loading}>
      <div className={cx('list-container')}>
        {data.list.map((v, idx) => (
          <React.Fragment key={`dataset-list-item ${idx}`}>
            <DataSetListItem
              item={v}
              selectedPath={data.selectedPath}
              setSelectedPath={handleChangePath}
            />
          </React.Fragment>
        ))}
      </div>
    </DataSetListContainer>
  );
};

export default ConnectDataSetList;
