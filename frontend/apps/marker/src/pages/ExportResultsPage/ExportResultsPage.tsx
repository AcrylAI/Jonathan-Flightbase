/* eslint-disable camelcase */
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { PageHeader } from '@src/components/molecules';

import { useGetProjectMetaData } from '@src/components/organisms/Modal/AssignModal/hooks/useGetProjectMetaData';
import ExportResultModal from '@src/components/organisms/Modal/ExportResultModal/ExportResultModal';

import ExportResultsPageContents from '@src/components/pageContents/ExportResultsPageContents/ExportResultsPageContents';

import useGetIsProjectOwner from '@src/hooks/Common/useGetIsProjectOwner/useGetIsProjectOwner';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import { useExportData } from './hooks/useExportResults';

import styles from './ExportResultPage.module.scss';
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);

export type TotalClassType = {
  color: string;
  deleted: number;
  id: number;
  lv1?: string;
  lv2?: string;
  lv3?: string;
  name?: string;
  tool: number;
  count: number;
};

export type ListProps = {
  dataCnt: number;
  exportedDate: string;
  format: string;
  labelCnt: number;
  status: number;
  url: string;
  userName: string;
  fileName: string;
};

export type ExportResultListType = {
  classGraph: Array<ClassGraphType>;
  exportList: Array<ListProps>;
  workInfo: WorkInfoProps;
  classLength?: number;
  list?: Array<ListProps>;
};

type ClassGraphType = {
  color: string;
  count: number;
  name: string;
  text_class_id: number;
};

type WorkInfoProps = {
  annotationTool?: string;
  connectedFolder: string;
  dataCnt: number;
  labelCnt: number;
  totalClass: Array<TotalClassType>;
};

function ExportResultsPage() {
  const { t } = useT();
  const params = useParams();
  const isOwner = useGetIsProjectOwner({ projectId: Number(params.pid) });
  const modal = useModal();
  const {
    data: useExportResultData,
    refetch,
    isLoading,
  } = useExportData({
    projectId: Number(params.pid),
  });

  const { data } = useGetProjectMetaData({
    projectId: Number(params.pid),
  });
  const onClickExport = (e: React.MouseEvent<HTMLButtonElement>) => {
    modal.createModal({
      title: 'Export Results',
      content: (
        <ExportResultModal
          refetch={() => {
            refetch();
          }}
          projectId={Number(params.pid)}
          classCount={useExportResultData?.result.classCount}
        />
      ),
      size: 'lg',
      control: false,
    });
  };
  const [exportData, setExportData] = useState<ExportResultListType>();
  useEffect(() => {
    setExportData(useExportResultData?.result);
  }, [useExportResultData]);

  return (
    <div>
      <PageHeader
        projectTitle
        projectTitleValue={data?.result?.name ?? ''}
        pageTitle={t('component.lnb.exportResults')}
        rightSection={isOwner && 'button'}
        color='blue'
        onClickAction={onClickExport}
        buttonText={t(`component.btn.export`)}
        btnDisabled={!exportData?.workInfo?.connectedFolder}
        loading={isLoading}
        leftSection='spinner'
      ></PageHeader>
      {exportData && (
        <ExportResultsPageContents data={exportData && exportData} />
      )}
    </div>
  );
}

export default ExportResultsPage;
