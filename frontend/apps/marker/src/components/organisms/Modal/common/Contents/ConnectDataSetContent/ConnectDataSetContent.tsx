import styles from './ConnectDataSetContent.module.scss';
import classNames from 'classnames/bind';
import ConnectDataSetDesc from './ConnectDataSetDesc/ConnectDataSetDesc';
import ConnectDataSetInfo from './ConnectDataSetInfo/ConnectDataSetInfo';
import ConnectDataSetList from './ConnectDataSetList/ConnectDataSetList';
import { ProjectModalDatasetModel } from '@src/stores/components/Modal/ProjectModalAtom';
import _ from 'lodash';
import ConnectDataSetSelectedPath from './ConnectDataSetSelectedPath/ConnectDataSetSelectedPath';

const cx = classNames.bind(styles);

type ConnectDataSetContentProps = {
  data: ProjectModalDatasetModel;
  loading: boolean;
  dataType: number;
  fileCount: number;
  onChangeData: (data: ProjectModalDatasetModel) => void;
};
const ConnectDataSetContent = ({
  data,
  loading,
  dataType,
  fileCount,
  onChangeData,
}: ConnectDataSetContentProps) => {
  return (
    <div className={cx('dataset-content-container')}>
      <ConnectDataSetDesc />
      <ConnectDataSetInfo type={dataType} />
      <ConnectDataSetSelectedPath path={data.viewPath} fileCount={fileCount} />
      <ConnectDataSetList
        data={data}
        loading={loading}
        onChangeData={onChangeData}
      />
    </div>
  );
};

export default ConnectDataSetContent;
