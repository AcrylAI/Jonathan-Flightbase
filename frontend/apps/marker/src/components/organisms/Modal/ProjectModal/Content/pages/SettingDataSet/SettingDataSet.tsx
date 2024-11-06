import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import _ from 'lodash';

import {
  ProjectModalAtom,
  ProjectModalAtomModel,
  ProjectModalDatasetModel,
} from '@src/stores/components/Modal/ProjectModalAtom';

import { toast } from '@src/components/molecules/Toast';

import ConnectDataSetContent from '@src/components/organisms/Modal/common/Contents/ConnectDataSetContent/ConnectDataSetContent';
import { useGetDataSetList } from '@src/components/organisms/Modal/common/Contents/ConnectDataSetContent/hooks/useGetDataSetList';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

import styles from './SettingDataSet.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const SettingDataSet = () => {
  const { t } = useT();
  const { userSession } = useUserSession();

  const [modalState, setModalState] =
    useRecoilState<ProjectModalAtomModel>(ProjectModalAtom);
  const { data, isLoading } = useGetDataSetList({
    workspaceId: userSession.workspaceId,
    type: modalState.default.dataType,
  });

  const onChangeData = (data: ProjectModalDatasetModel) => {
    const temp = _.cloneDeep(modalState);
    temp.dataset = data;
    setModalState(temp);
  };

  const setDataSetList = () => {
    if (!isLoading) {
      if (data && data.status === 1) {
        const temp = _.cloneDeep(modalState);
        temp.dataset.list = Array.isArray(data.result) ? data.result : [];
        setModalState(temp);
      } else {
        toast.error(`${t(`toast.common.getListFailed`)}`);
      }
    }
  };

  useEffect(() => {
    setDataSetList();
  }, [data]);

  return (
    <div className={cx('setting-dataset-container')}>
      <ConnectDataSetContent
        fileCount={modalState.dataset.fileCount}
        loading={isLoading}
        data={modalState.dataset}
        dataType={modalState.default.dataType}
        onChangeData={onChangeData}
      />
    </div>
  );
};

export default SettingDataSet;
