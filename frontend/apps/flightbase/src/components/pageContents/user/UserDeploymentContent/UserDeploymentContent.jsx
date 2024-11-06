// i18n
import { useTranslation } from 'react-i18next';

// Components
import PageTitle from '@src/components/atoms/PageTitle';
import ListFilter from './ListFilter';
import CardList from './CardList';
import Template from './Template/Template';

// CSS Module
import classNames from 'classnames';
import style from './UserDeploymentContent.module.scss';

const cx = classNames.bind(style);
const DEPLOYMENT_TAB = 'DEPLOYMENT_TAB';

/**
 * 배포 목록 페이지 컴포넌트
 * @param {{
 *  watchFilterViewType: ({ filter, search }) => {}
 *  deploymentList: [{}],
 *  isLoading: boolean,
 *  openCreateDeploymentModal: Function,
 *  openCreateApiCodeModal: Function,
 *  refreshData: Function,
 * }}
 * @component
 * @example
 *
 * const watchFilterViewType = ({ filter, search }) => {};
 *
 * const openCreateDeploymentModal = () => {
 *  // Open deployment modal...
 * };
 *
 * const openCreateApiCodeModal = () => {
 *  // Open deployment api modal...
 * };
 *
 * const refreshData = () => {
 *   // refresh data
 * }
 *
 * return (
 *    <UserDeploymentContent
 *      watchFilterViewType={watchFilterViewType}
 *      isLoading={isLoading}
 *      openCreateDeploymentModal={openCreateDeploymentModal]}
 *      openCreateApiCodeModal={openCreateApiCodeModal]}
 *      refreshData={refreshData}
 *    />
 * )
 *
 * -
 */
function UserDeploymentContent({
  watchFilterViewType,
  deploymentList,
  isLoading,
  openCreateDeploymentModal,
  openCreateApiCodeModal,
  refreshData,
  groupData,
  getGroupData,
  getTemplateData,
  clickedGroupId,
  templateData,
  setClickedGroupId,
  defaultGroupName,
  noGroupSelectedStatus,
  onClickNoGroup,
  onClickGroupList,
  selectedGroupData,
  tab,
  tabHandler,
}) {
  const { t } = useTranslation();

  return (
    <div className={cx('deployment-list-page')}>
      {/* 제목 및 필터 영역 */}
      <PageTitle>{t('serving.label')}</PageTitle>
      <ListFilter
        watchFilterViewType={watchFilterViewType}
        openCreateApiCodeModal={openCreateApiCodeModal}
        tab={tab}
        tabHandler={tabHandler}
      />
      {/* 배포 영역 / 템플릿 영역 */}
      {tab === DEPLOYMENT_TAB ? (
        <CardList
          deploymentList={deploymentList}
          isLoading={isLoading}
          onClickCard={openCreateDeploymentModal}
          refreshData={refreshData}
        />
      ) : (
        <Template
          groupData={groupData}
          getGroupData={getGroupData}
          getTemplateData={getTemplateData}
          clickedGroupId={clickedGroupId}
          templateData={templateData}
          setClickedGroupId={setClickedGroupId}
          defaultGroupName={defaultGroupName}
          onClickNoGroup={onClickNoGroup}
          noGroupSelectedStatus={noGroupSelectedStatus}
          onClickGroupList={onClickGroupList}
          selectedGroupData={selectedGroupData}
        />
      )}
    </div>
  );
}

export default UserDeploymentContent;
