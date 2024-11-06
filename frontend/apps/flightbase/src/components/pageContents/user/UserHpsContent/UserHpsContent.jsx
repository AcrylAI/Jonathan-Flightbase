import { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';

// Components
import { InputText, Button, Selectbox } from '@jonathan/ui-react';
import HpsList from './HpsList';
import PageTitle from '@src/components/atoms/PageTitle';
import Loading from '@src/components/atoms/loading/Loading';
import UsecaseList from '@src/components/organisms/UsecaseList';
import EmptyBox from '@src/components/molecules/EmptyBox';

// Icons
import ArrowIcon from '@src/static/images/icon/ic-left.svg';

// CSS module
import style from './UserHpsContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const HpsContent = ({
  wid,
  tid,
  hpsListData,
  totalHpsRows,
  hpsSearchKey,
  hpsKeyword,
  onHpsSearchKeyChange,
  onHpsSearch,
  onCreateHPSGroup,
  onAddHps,
  openDeleteConfirmPopup,
  onSelect,
  deleteBtnDisabled,
  createBtnDisabled,
  trainingInfo,
  toolInfo,
  onViewHpsLog,
  selectedRows,
  onStopHps,
  onStopHpsGroup,
  openCheckPointPopup,
  loading,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { type: trainingType, name: trainingName } = trainingInfo;
  const { dockerImageName, gpuCount, gpuModel } = toolInfo;

  const [isAllOpen, setIsAllOpen] = useState(false);

  const hpsSearchOptions = [
    { label: t('hpsName.label'), value: 'name' },
    { label: t('hpsMethod.label'), value: 'method' },
    { label: t('dockerImage.label'), value: 'docker_image_name' },
    { label: t('datasets.label'), value: 'dataset_name' },
    { label: t('creator.label'), value: 'creator' },
  ];

  if (trainingType === 'advanced') {
    hpsSearchOptions.push({ label: t('runCode.label'), value: 'run_code' });
  }
  const manualOpenHandler = (boolean) => {
    setIsAllOpen(boolean);
  };

  const hpsList =
    hpsListData &&
    hpsListData.map((list, index) => (
      <HpsList
        key={index}
        data={list}
        trainingInfo={trainingInfo}
        openDeleteConfirmPopup={openDeleteConfirmPopup}
        onCreate={onAddHps}
        onSelect={onSelect}
        onViewLog={onViewHpsLog}
        selectedRows={selectedRows}
        onStopHps={onStopHps}
        onStopHpsGroup={onStopHpsGroup}
        openCheckPointPopup={openCheckPointPopup}
        type={trainingType}
        isAllOpen={isAllOpen}
        manualOpenHandler={manualOpenHandler}
      />
    ));

  let hpsCount = 0;
  hpsListData.map(({ hps_list: hpss }) => {
    hpsCount += hpss.length;
    return hpsCount;
  });

  const usecaseList = [
    {
      title: t('hps.usecase1.title.message'),
      description: t('hps.usecase1.desc.message'),
      button: (
        <Button
          type='primary-light'
          onClick={onCreateHPSGroup}
          disabled={createBtnDisabled}
        >
          {t('createHPS.label')}
        </Button>
      ),
    },
    {
      title: t('hps.usecase2.title.message'),
      description: t('hps.usecase2.desc.message'),
      button: (
        <Button
          type='primary-light'
          onClick={onCreateHPSGroup}
          disabled={createBtnDisabled}
        >
          {t('createHPS.label')}
        </Button>
      ),
    },
    {
      title: t('hps.usecase3.title.message'),
      description: t('hps.usecase3.desc.message'),
      button: (
        <Button
          type='primary-light'
          onClick={onCreateHPSGroup}
          disabled={createBtnDisabled}
        >
          {t('createHPS.label')}
        </Button>
      ),
    },
  ];

  /**
   * HPS 수정 모달 (리팩토링할 때 page로 이동)
   */
  const onUpdate = () => {
    dispatch(
      openModal({
        modalType: 'EDIT_TRAINING_TOOL',
        modalData: {
          submit: {
            text: t('edit.label'),
            func: () => {
              dispatch(closeModal('EDIT_TRAINING_TOOL'));
            },
          },
          cancel: {
            text: t('cancel.label'),
          },
          trainingType: trainingType,
          toolType: 3,
          toolId: toolInfo.toolId,
          trainingId: tid,
          workspaceId: wid,
        },
      }),
    );
  };

  return (
    <div id='UserHpsContent' className={cx('content')}>
      <div className={cx('title-box')}>
        <PageTitle>{trainingName}</PageTitle>
      </div>
      <div className={cx('hps-box')}>
        <div className={cx('name-box')}>
          <div className={cx('icon')}>
            <img src='/images/icon/ic-hps.svg' alt='HPS icon' />
          </div>
          <label className={cx('label')}>HPS</label>
        </div>
        <div className={cx('info-box')}>
          <ul className={cx('info-list')}>
            <li>
              <label className={cx('label')}>{t('dockerImage.label')}</label>
              <span className={cx('value')}>{dockerImageName || '-'}</span>
            </li>
            <li>
              <label className={cx('label')}>{t('resource.label')}</label>
              <span className={cx('value')}>GPU*{gpuCount}</span>
            </li>
            <li>
              <label className={cx('label')}>GPU {t('model.label')}</label>
              <span className={cx('value')}>{gpuModel.join(', ') || '-'}</span>
            </li>
          </ul>
          <div className={cx('btn-box')}>
            <Button
              type='primary-reverse'
              icon='/images/icon/ic-edit-blue.svg'
              iconAlign='left'
              customStyle={{ border: '1px solid #2d76f8' }}
              onClick={onUpdate}
            >
              {t('edit.label')}
            </Button>
            {/* HPS Group 생성 */}
            <Button
              type='primary'
              icon='/images/icon/00-ic-basic-plus-white.svg'
              iconAlign='left'
              onClick={onCreateHPSGroup}
              disabled={createBtnDisabled}
            >
              {t('createHPS.label')}
            </Button>
          </div>
        </div>
      </div>
      <div className={cx('hps-container')}>
        {hpsList && totalHpsRows > 0 && (
          <div className={cx('search-box')}>
            <div className={cx('filter-search')}>
              <div className={cx('search')}>
                <Fragment>
                  <div className={cx('job-menu-box')}>
                    <div className={cx('job-menu-left')}>
                      <Button
                        type='none-border'
                        onClick={() => manualOpenHandler(true)}
                        icon={ArrowIcon}
                        iconAlign='right'
                        iconStyle={{ transform: 'rotate(270deg)' }}
                        customStyle={{
                          padding: '8px',
                        }}
                      >
                        {t('allExpand.label')}
                      </Button>
                      <Button
                        type='none-border'
                        onClick={() => manualOpenHandler(false)}
                        icon={ArrowIcon}
                        iconAlign='right'
                        iconStyle={{ transform: 'rotate(90deg)' }}
                        customStyle={{
                          padding: '8px',
                          marginLeft: '4px',
                        }}
                      >
                        {t('allCollapse.label')}
                      </Button>
                    </div>
                    <div className={cx('job-menu-right')}>
                      <div>
                        <Selectbox
                          list={hpsSearchOptions}
                          selectedItem={hpsSearchKey}
                          onChange={onHpsSearchKeyChange}
                          customStyle={{
                            fontStyle: {
                              selectbox: {
                                fontSize: '13px',
                              },
                            },
                          }}
                        />
                      </div>
                      <InputText
                        size='medium'
                        placeholder={t('search.placeholder')}
                        leftIcon='/images/icon/ic-search.svg'
                        value={hpsKeyword}
                        onChange={(e) => {
                          onHpsSearch(e.target.value);
                        }}
                        onClear={() => onHpsSearch('')}
                        customStyle={{ width: '168px' }}
                        disableLeftIcon={false}
                      />
                    </div>
                  </div>
                </Fragment>
              </div>
            </div>
          </div>
        )}
        <div className={cx('contents-container')}>
          {loading ? (
            <div className={cx('loading-box')}>
              <Loading />
            </div>
          ) : totalHpsRows === 0 ? (
            <div className={cx('empty-box')}>
              <div className={cx('left-box')}>
                <div className={cx('title')}>Hyper Parameter Search</div>
                <div className={cx('description')}>
                  {t('hps.emptycase.desc.message')}
                </div>
                <div className={cx('img')}>
                  <img src='/images/icon/hps-empty.png' alt='' />
                </div>
              </div>
              <div className={cx('right-box')}>
                <UsecaseList list={usecaseList} />
              </div>
            </div>
          ) : (
            <div className={cx('list-container')}>{hpsList}</div>
          )}
          {!loading && totalHpsRows !== 0 && hpsList.length === 0 && (
            <div className={cx('no-result')}>
              <EmptyBox text={t('noSearchResult.message')} />
            </div>
          )}
        </div>
        {hpsList && hpsList.length > 0 && (
          <div className={cx('btn-box')}>
            <Button
              type='red-light'
              size='medium'
              onClick={() => openDeleteConfirmPopup(undefined, false)}
              disabled={deleteBtnDisabled}
            >
              {t('deleteSelected.label')}
            </Button>
            <Button
              type='red-reverse'
              size='medium'
              onClick={() => openDeleteConfirmPopup(undefined, true)}
              customStyle={{ backgroundColor: 'transparent', border: 'none' }}
            >
              {t('deleteAll.label')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HpsContent;
