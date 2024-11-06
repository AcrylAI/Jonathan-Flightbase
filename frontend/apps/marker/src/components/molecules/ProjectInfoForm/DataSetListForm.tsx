import { useState } from 'react';

import { Switch as SwitchBtn } from '@jonathan/ui-react';

import { Case, Switch } from '@jonathan/react-utils';

import usePutDataAutoSync from '@src/pages/ProjectInfoPage/hooks/usePutDataAutoSync';

import { Sypo } from '@src/components/atoms';
import Spinner from '@src/components/atoms/Loader/Spinner/Spinner';

import { toast } from '@src/components/molecules/Toast';

// i18n
import useT from '@src/hooks/Locale/useT';

import { InfoIcon, WarningIcon } from '@src/static/images';

import styles from './ProjectInfoForm.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

import { DatasetDataTypes } from '@src/components/pageContents/ProjectInfoContents/ProjectInfoContents';

type Props = {
  datasetData: DatasetDataTypes;
  projectId: number;
  refetch: () => void;
};

const DataSetListForm = ({ datasetData, projectId, refetch }: Props) => {
  const { t } = useT();
  const autoSyncValue = datasetData.autoSync !== 0;
  const [autoSyncState, setAutoSyncState] = useState<boolean>(autoSyncValue);
  const { mutateAsync: putRequest } = usePutDataAutoSync();

  const [openAutoSyncTip, setOpenAutoSyncTip] = useState<boolean>(false);
  const [warningToolTip, setWarningToolTip] = useState<boolean>(false);

  const onChangeAutoSyncValue = async () => {
    setAutoSyncState(!autoSyncState);

    if (autoSyncState) {
      const res = await putRequest({ projectId, sync: 0 });

      if (res.status === 1) {
        toast.success('자동 동기화 취소 설정이 완료되었습니다.');
        refetch();
      } else {
        toast.error('자동 동기화 취소 설정을 실패 했습니다.');
      }
    } else if (!autoSyncState) {
      const res = await putRequest({ projectId, sync: 1 });

      if (res.status === 1) {
        toast.success('자동 동기화 설정이 완료되었습니다.');
        refetch();
      } else {
        toast.error('자동 동기화 설정을 실패 했습니다.');
      }
    }
  };

  const onAutoSyncMouseOver = () => {
    setOpenAutoSyncTip(!openAutoSyncTip);
  };

  const onAutoSyncMouseOut = () => {
    setOpenAutoSyncTip(!openAutoSyncTip);
  };

  const onWarningMouseOver = () => {
    setWarningToolTip(!warningToolTip);
  };

  const onWarningMouseOut = () => {
    setWarningToolTip(!warningToolTip);
  };

  return (
    <>
      {datasetData.dataSync === 1 && (
        <div className={cx('data-sync-loading')}>
          <Spinner width={64} height={64} />
        </div>
      )}
      <div className={cx('dataset-item-container')}>
        <div className={cx('dataset-item-wrapper')}>
          <p className={cx('item-title')}>
            <Sypo type='P1' weight={400}>
              {t(`page.projectInfo.datasetName`)}
            </Sypo>
          </p>
          <p className={cx('item-data')}>
            <Sypo type='P1' weight={400}>
              {datasetData.name}
            </Sypo>
          </p>
        </div>
        <div className={cx('dataset-item-wrapper')}>
          <p className={cx('item-title')}>
            <Sypo type='P1' weight={400}>
              {t(`page.projectInfo.folderName`)}
            </Sypo>
          </p>
          <p className={cx('item-data')}>
            <Sypo type='P1' weight={400}>
              {datasetData.folder}
            </Sypo>
          </p>
        </div>
        <div className={cx('dataset-item-wrapper')}>
          <p className={cx('item-title')}>
            <Sypo type='P1' weight={400}>
              {t(`page.projectInfo.folderPath`)}
            </Sypo>
          </p>
          <p className={cx('item-data')}>
            <Sypo type='P1' weight={400}>
              {datasetData.path}
            </Sypo>
          </p>
        </div>
        <div className={cx('dataset-item-wrapper')}>
          <p className={cx('item-title')}>
            <Sypo type='P1' weight={400}>
              {t(`page.projectInfo.dataCount`)}
            </Sypo>
          </p>
          <p className={cx('item-data')}>
            <Sypo type='P1' weight={400}>
              {datasetData.dataCount.toLocaleString()}
            </Sypo>
          </p>
          <Switch>
            <Case condition={datasetData.dataError === 1}>
              <img
                src={WarningIcon}
                alt=''
                style={{ width: '18px', height: '18px' }}
                onMouseOver={onWarningMouseOver}
                onMouseOut={onWarningMouseOut}
              />
              <div
                className={cx('data-warning-tip', warningToolTip && 'active')}
              >
                <p className={cx('data-warning-desc')}>
                  <Sypo type='P1' weight={400}>
                    {t(`component.ToolTip.dataSyncFirst`)}
                    <br />
                    {t(`component.ToolTip.dataSyncSecond`)}
                  </Sypo>
                </p>
              </div>
            </Case>
            <Case condition={datasetData.dataError === 0}>
              <></>
            </Case>
          </Switch>
        </div>
        <div className={cx('dataset-item-wrapper')}>
          <div className={cx('item-title')}>
            <p>
              <Sypo type='P1' weight={400}>
                {t(`page.projectInfo.lastSync`)}
              </Sypo>
            </p>
          </div>
          <p className={cx('item-data')}>
            <Sypo type='P1' weight={400}>
              {datasetData.lastSyncDate}
            </Sypo>
          </p>
        </div>
        <div className={cx('dataset-item-wrapper', 'auto-sync')}>
          <p className={cx('item-title')}>
            <Sypo type='P1' weight={400}>
              {t(`page.projectInfo.autoSync`)}
            </Sypo>
          </p>
          <SwitchBtn checked={autoSyncState} onChange={onChangeAutoSyncValue} />
          <img
            src={InfoIcon}
            alt=''
            onMouseOver={onAutoSyncMouseOver}
            onMouseOut={onAutoSyncMouseOut}
          />
          <div className={cx('auto-sync-tip', openAutoSyncTip && 'active')}>
            <p className={cx('auto-sync-desc')}>
              <Sypo type='P1' weight={400}>
                {t(`component.ToolTip.autoSync`)}
              </Sypo>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataSetListForm;
