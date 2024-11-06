import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@jonathan/ui-react';

import usePostDataSync from '@src/pages/ProjectInfoPage/hooks/usePostDataSync';

import { ItemContainer, Sypo } from '@src/components/atoms';

import {
  DataSetListForm,
  GuideListForm,
  InfoListForm,
  NoGuideLine,
  NotConnectedDataset,
  PageHeader,
} from '@src/components/molecules';
import { toast } from '@src/components/molecules/Toast';

import { DeleteProjectModal, EditDescModal } from '@src/components/organisms';
import { useGetProjectMetaData } from '@src/components/organisms/Modal/AssignModal/hooks/useGetProjectMetaData';
import ConnectDataSetModal from '@src/components/organisms/Modal/ConnectDataSetModal/ConnectDataSetModal';
// API
import { useUploadGuideFile } from '@src/components/organisms/Modal/ProjectModal/hooks/useUploadGuideFile';

// i18n
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import {
  ConnectIcon,
  PencilIcon,
  ReloadIcon,
  UploadIcon,
} from '@src/static/images';

import styles from './ProjectInfoContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

export type GuideDataTypes = {
  createdDate: string;
  id: number;
  name: string;
  url: string;
};

export type InfoDataTypes = {
  createdDate: string;
  datasetInfo: DatasetDataTypes;
  description: string;
  guide: Array<GuideDataTypes>;
  mobile: 0 | 1;
  owner: string;
  title: string;
  tools: Array<'Bounding-box' | 'Polygon'>;
  type: string;
  workflow: 0 | 1;
};

export type DatasetDataTypes = {
  autoSync: 0 | 1;
  dataCount: number;
  dataError: 0 | 1;
  dataSync: 0 | 1;
  folder: string;
  lastSyncDate: string;
  name: string;
  path: string;
};

type Props = {
  infoData: InfoDataTypes;
  datasetData: DatasetDataTypes;
  guideData: Array<GuideDataTypes>;
  projectId: number;
  refetch: () => void;
  userName: string;
};

const ProjectInfoContents = ({
  infoData,
  datasetData,
  guideData,
  projectId,
  refetch,
  userName,
}: Props) => {
  const { t } = useT();
  const modal = useModal();
  const fileUploadMutation = useUploadGuideFile();
  const { data: metaData } = useGetProjectMetaData({ projectId });
  const { mutateAsync: postRequest } = usePostDataSync();
  const isOwner = userName === infoData.owner;
  const buttonDefaultStyle = {
    height: '30px',
    fontFamily: 'spoqaR',
    fontSize: '12px',
    padding: '8px 16px 8px 12px',
    border: 'none',
  };

  const [fileList, setFileList] = useState<Array<File>>([]);

  const onClickConnectDataset = () => {
    modal.createModal({
      title: 'Connect Dataset',
      content: <ConnectDataSetModal refetch={refetch} projectId={projectId} />,
      fullscreen: true,
    });
  };

  const openEditModal = () => {
    modal.createModal({
      title: 'Edit Project Description',
      content: (
        <EditDescModal
          refetch={refetch}
          projectId={projectId}
          infoDesc={infoData.description}
        />
      ),
    });
  };
  const onEditClick = () => {
    openEditModal();
  };

  const openDeleteModal = () => {
    modal.createModal({
      title: 'Delete Project',
      content: (
        <DeleteProjectModal
          projectId={projectId}
          projectName={infoData.title}
          refetch={() => {
            refetch();
          }}
        />
      ),
    });
  };

  const onDeleteClick = () => {
    openDeleteModal();
  };

  const uploadFile = useRef<HTMLInputElement>(null);

  const onUploadClick = () => {
    if (uploadFile.current) {
      uploadFile.current.click();
    }
  };

  const postFile = async () => {
    const form = new FormData();
    form.append('projectId', `${projectId}`);

    fileList.forEach((v) => {
      form.append('guide', v);
    });
    const filseRes = await fileUploadMutation.mutateAsync(form);

    if (filseRes.status === 1) {
      toast.success(t(`toast.common.uploadFileSuccess`));
      setFileList([]);
      refetch();
    } else {
      toast.error(t(`toast.common.uploadFilefailed`));
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.files;

    if (value) {
      const dataList: Array<File> = [];
      for (let i = 0; i < value.length; i++) {
        dataList.push(value[i]);
      }
      setFileList(dataList);
    }
  };

  const fileHandler = () => {
    if (fileList.length > 0) {
      postFile();
    }
  };

  const onSyncClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const res = await postRequest({ projectId });
    refetch();
    if (res.status === 1) {
      toast.success(t(`toast.dataSync.dataSyncComplete`));
    } else {
      toast.error(t(`toast.dataSync.dataSyncFailed`));
    }
  };

  useEffect(() => {
    fileHandler();
  }, [fileList]);

  return (
    <div className={cx('page-container')}>
      <PageHeader
        rightSection={isOwner && 'button'}
        color='red'
        buttonText={t(`component.btn.delete`)}
        onClickAction={onDeleteClick}
        projectTitle
        projectTitleValue={metaData?.result?.name ?? ''}
        pageTitle={t(`page.header.projectInfo`)}
      />
      {!infoData.title ? (
        <></>
      ) : (
        <div className={cx('page-contents-container')}>
          <div className={cx('contents-left-section')}>
            <ItemContainer
              containerCustomStyle={{
                height: '100%',
              }}
              headerTitle={t(`page.projectInfo.info`)}
              headerContents={
                userName === infoData.owner && (
                  <Button
                    size='x-small'
                    type='primary-light'
                    icon={PencilIcon}
                    customStyle={buttonDefaultStyle}
                    onClick={onEditClick}
                  >
                    <Sypo type='P2' weight={400}>
                      {t(`component.btn.edit`)}
                    </Sypo>
                  </Button>
                )
              }
              itemContents={<InfoListForm InfoData={infoData ?? []} />}
            />
          </div>
          <div className={cx('contents-right-section')}>
            <ItemContainer
              headerTitle={t(`page.projectInfo.connectedDataset`)}
              headerContents={
                userName === infoData.owner &&
                (datasetData ? (
                  <Button
                    size='x-small'
                    type='primary-light'
                    icon={ReloadIcon}
                    customStyle={buttonDefaultStyle}
                    onClick={onSyncClick}
                  >
                    <Sypo type='P2' weight={400}>
                      {t(`component.btn.sync`)}
                    </Sypo>
                  </Button>
                ) : (
                  <Button
                    size='x-small'
                    type='primary-light'
                    icon={ConnectIcon}
                    customStyle={buttonDefaultStyle}
                    onClick={onClickConnectDataset}
                  >
                    <Sypo type='P2' weight={400}>
                      {t(`component.btn.connect`)}
                    </Sypo>
                  </Button>
                ))
              }
              itemContentsCustomStyle={{
                padding: '0px',
                position: 'relative',
                height: '100%',
                overflowX: 'hidden',
              }}
              itemContents={
                datasetData ? (
                  <>
                    <DataSetListForm
                      datasetData={datasetData ?? []}
                      projectId={projectId ?? ''}
                      refetch={refetch}
                    />
                  </>
                ) : (
                  <NotConnectedDataset isOwner={userName === infoData.owner} />
                )
              }
            />
            <ItemContainer
              headerTitle={
                <div className={cx('guide-container-header')}>
                  <p>{t(`page.projectInfo.guideline`)}</p>
                  <Sypo type='P2' weight={400}>
                    <p className={cx('guide-type-desc')}>
                      {t(`page.projectInfo.guideFileTypeDesc`)}
                    </p>
                  </Sypo>
                </div>
              }
              headerContents={
                userName === infoData.owner && (
                  <div className={cx('upload-button-wrapper')}>
                    <input
                      type='file'
                      accept='.pdf, .ppt, .pptx'
                      multiple
                      style={{ display: 'none' }}
                      ref={uploadFile}
                      onChange={onFileChange}
                    />
                    <Button
                      onClick={() => onUploadClick()}
                      size='x-small'
                      type='primary-light'
                      icon={UploadIcon}
                      customStyle={buttonDefaultStyle}
                    >
                      <Sypo type='P2' weight={400}>
                        {t(`component.btn.upload`)}
                      </Sypo>
                    </Button>
                  </div>
                )
              }
              itemContentsCustomStyle={{
                width: '100%',
                height: '100%',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
              }}
              itemContents={
                guideData?.length === 0 ? (
                  <NoGuideLine isOwner={userName === infoData.owner} />
                ) : (
                  <GuideListForm guideData={guideData} refetch={refetch} />
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectInfoContents;
