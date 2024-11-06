// Components
import ListFilter from './ListFilter';
import CardList from './CardList';
import TableList from './TableList';

// CSS Module
import classNames from 'classnames';
import style from './UserTrainingContent.module.scss';
const cx = classNames.bind(style);

/**
 * 학습 목록 페이지 컴포넌트
 * @param {{
 *  watchFilterViewType: ({ filter, viewType }) => {}
 *  trainingList: [{}],
 *  selectedViewType: 'CARD_VIEW' | 'TABLE_VIEW',
 *  isLoading: boolean,
 *  openCreateTrainingModal: Function,
 *  refreshData: Function,
 * }}
 * @component
 * @example
 *
 * const watchFilterViewType = ({ filter, viewType }) => {};
 *
 * const openCreateTrainingModal = () => {
 *  // Open training modal...
 * };
 *
 * const refreshData = () => {
 *   // refresh data
 * }
 *
 * return (
 *    <UserTrainingContent
 *      watchFilterViewType={watchFilterViewType}
 *      selectedViewType='CARD_VIEW'
 *      isLoading={isLoading}
 *      openCreateTrainingModal={openCreateTrainingModal]}
 *      refreshData={refreshData}
 *    />
 * )
 *
 *
 *
 * -
 */
function UserTrainingContent({
  watchFilterViewType,
  trainingList,
  selectedViewType,
  isLoading,
  openCreateTrainingModal,
  refreshData,
}) {
  return (
    <div className={cx('training-list-page')}>
      {/* 제목 및 필터 영역 */}
      <ListFilter
        watchFilterViewType={watchFilterViewType}
        selectedViewType={selectedViewType}
        onCreate={openCreateTrainingModal}
      />
      {/* 리스트 영역 */}
      {selectedViewType === 'CARD_VIEW' && (
        <CardList
          trainingList={trainingList}
          isLoading={isLoading}
          onClickCard={openCreateTrainingModal}
          refreshData={refreshData}
        />
      )}
      {selectedViewType === 'TABLE_VIEW' && (
        <TableList
          trainingList={trainingList}
          isLoading={isLoading}
          refreshData={refreshData}
        />
      )}
    </div>
  );
}

export default UserTrainingContent;
