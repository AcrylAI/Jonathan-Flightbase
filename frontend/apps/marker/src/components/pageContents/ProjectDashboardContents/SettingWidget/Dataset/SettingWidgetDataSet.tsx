import { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import {
  SettingWidgetAtom,
  SettingWidgetAtomType,
} from '@src/stores/components/SettingWidget/SettingWidgetAtom';

import useGetProjectInfo from '@src/pages/ProjectInfoPage/hooks/useGetProjectInfo';
import usePostDataSync from '@src/pages/ProjectInfoPage/hooks/usePostDataSync';

import SettingWidgetContainer from '../Container/SettingWidgetContainer';

import { toast } from '@src/components/molecules/Toast';

import { useGetProjectMetaData } from '@src/components/organisms/Modal/AssignModal/hooks/useGetProjectMetaData';
import ConnectDataSetModal from '@src/components/organisms/Modal/ConnectDataSetModal/ConnectDataSetModal';

import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import styles from './SettingWidgetDataSet.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type IconProps = {
  isLoading: boolean;
};
const ThunderIcon = ({ isLoading }: IconProps) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cx('icon', isLoading && 'loading')}
    >
      <path
        d='M20.2304 11.0797C20.2026 10.9588 20.1452 10.8467 20.0634 10.7535C19.9816 10.6602 19.8779 10.5887 19.7617 10.5453L14.3617 8.52035L15.7304 1.64847C15.7619 1.48929 15.7416 1.32422 15.6724 1.17744C15.6032 1.03066 15.4888 0.909895 15.346 0.832848C15.2018 0.756136 15.0363 0.729251 14.8752 0.756381C14.7141 0.78351 14.5665 0.86313 14.4554 0.982848L3.95542 12.2328C3.86938 12.3221 3.80713 12.4315 3.77437 12.5511C3.74161 12.6707 3.73939 12.7966 3.76792 12.9172C3.79727 13.0374 3.85521 13.1488 3.93682 13.2418C4.01843 13.3349 4.12129 13.4068 4.23667 13.4516L9.63667 15.4766L8.26792 22.3485C8.23644 22.5077 8.25678 22.6727 8.32595 22.8195C8.39512 22.9663 8.50949 23.0871 8.65229 23.1641C8.75993 23.2184 8.87861 23.2473 8.99917 23.2485C9.10105 23.2489 9.20192 23.2283 9.29548 23.188C9.38904 23.1477 9.47328 23.0885 9.54292 23.0141L20.0429 11.7641C20.129 11.6748 20.1912 11.5654 20.224 11.4458C20.2567 11.3263 20.2589 11.2004 20.2304 11.0797V11.0797Z'
        fill='#C8CCD4'
      />
    </svg>
  );
};

const SettingWidgetDataSet = () => {
  const modal = useModal();
  const params = useParams();
  const [widgetState] =
    useRecoilState<SettingWidgetAtomType>(SettingWidgetAtom);
  const { t } = useT();
  const [isSync, setIsSync] = useState<boolean>(false);
  const { mutateAsync: syncReq } = usePostDataSync();
  const { data: syncData, refetch: syncRefetch } = useGetProjectInfo({
    id: Number(params.pid),
  });
  const { data, refetch } = useGetProjectMetaData({
    projectId: Number(params.pid),
  });

  const containerLabel = () => {
    let result = `${t(`page.dashboardProject.dataset`)}`;

    if (!data?.status || data.result.dataId) {
      result = `${t(`component.settingWidget.datasetSync`)}`;
    }
    if (isSync) {
      result = `${t(`component.settingWidget.synchronizing`)}`;
    }
    return result;
  };

  const onClickWidget = async () => {
    if (data?.result.dataId === 0) {
      modal.createModal({
        title: 'connect dataset',
        content: (
          <ConnectDataSetModal
            refetch={() => {
              refetch();
            }}
            projectId={Number(params.pid)}
          />
        ),
        fullscreen: true,
      });
    } else {
      // data sync request
      const res = await syncReq({ projectId: Number(params.pid) });
      setIsSync(true);
      if (res?.status === 1) {
        syncRefetch();
      } else {
        toast.error(`${t(`toast.common.requestFailed`)}`);
      }
    }
  };
  const handleSync = () => {
    if (syncData?.result.datasetInfo && isSync) {
      const { dataSync } = syncData.result.datasetInfo;
      setIsSync(dataSync === 1);
      widgetState.refetch();
      if (dataSync === 0) {
        toast.success(`${t(`toast.dataSync.dataSyncComplete`)}`);
      }
    }
  };
  const initialize = () => {
    if (syncData?.result.datasetInfo) {
      const { dataSync } = syncData.result.datasetInfo;
      setIsSync(dataSync === 1);
    }
  };

  useEffect(() => {
    handleSync();
  }, [syncData, isSync]);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <SettingWidgetContainer
      label={containerLabel()}
      icon={<ThunderIcon isLoading={isSync} />}
      onClick={onClickWidget}
      isLoading={isSync}
    />
  );
};

export default SettingWidgetDataSet;
