import { useParams } from 'react-router-dom';

import { PageHeader } from '@src/components/molecules';

import AutoLabelingModal from '@src/components/organisms/Modal/AutoLabelingModal/AutoLabelingModal';

import {
  AutoLabelingSetContents,
  NoAutoLabelingSetContent,
} from '@src/components/pageContents';

import useGetProjectMetaData from '@src/hooks/Api/useGetProjectMetaData';
import useGetIsProjectOwner from '@src/hooks/Common/useGetIsProjectOwner/useGetIsProjectOwner';
import useT from '@src/hooks/Locale/useT';
import useModal from '@src/hooks/Modal/useModal';

import useGetClassList from './hooks/useGetClassList';

import styles from './AutoLabelingSetPage.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const AutoLabelingSetPage = () => {
  const { t } = useT();

  const modal = useModal();
  const projectId = Number(useParams().pid);
  const { data: metaData } = useGetProjectMetaData({ projectId });
  const isOwner = useGetIsProjectOwner({ projectId });
  const response = useGetClassList({ projectId });
  const { data, refetch, isLoading } = response;

  const onClickSetAutolabeler = () => {
    // add modal
    modal.createModal({
      title: 'Set AutoLabeling',
      startFullscreen: true,
      content: (
        <AutoLabelingModal
          refetch={() => {
            refetch();
          }}
          projectId={Number(projectId)}
        />
      ),
    });
  };
  return (
    <div className={cx('page-container')}>
      <PageHeader
        leftSection='spinner'
        rightSection={isOwner && 'button'}
        color='blue'
        buttonText={t(`component.btn.setAutolabeling`)}
        onClickAction={onClickSetAutolabeler}
        loading={isLoading}
        projectTitle
        projectTitleValue={metaData?.result?.name ?? ''}
        pageTitle={t(`page.autolabeling.autoLabelingSetHeader`)}
      />
      {/* 설정 리스트가 없다면 해당 컴포넌트 출력, isOwner 전달 */}
      {data?.result.length < 1 ? (
        <NoAutoLabelingSetContent isOwner={isOwner} />
      ) : (
        <AutoLabelingSetContents dataList={data?.result ?? []} />
      )}
    </div>
  );
};

export default AutoLabelingSetPage;
