import { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Actions
import { openModal, closeModal } from '@src/store/modules/modal';

// Components
import { InputText, Button, Selectbox } from '@jonathan/ui-react';
import JobList from './JobList';
import PageTitle from '@src/components/atoms/PageTitle';
import Loading from '@src/components/atoms/loading/Loading';
import UsecaseList from '@src/components/organisms/UsecaseList';
import EmptyBox from '@src/components/molecules/EmptyBox';

// Icons
import ArrowIcon from '@src/static/images/icon/ic-left.svg';

// CSS module
import style from './UserJobContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const UserJobContent = ({
  wid,
  tid,
  jobListData,
  totalJobRows,
  jobSearchKey,
  jobKeyword,
  onJobSearchKeyChange,
  onJobSearch,
  onCreateJob,
  openDeleteConfirmPopup,
  onSelect,
  deleteBtnDisabled,
  createBtnDisabled,
  trainingInfo,
  toolInfo,
  onViewJobLog,
  selectedRows,
  onStopJob,
  onStopJobs,
  loading,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { type: trainingType, name: trainingName } = trainingInfo;
  const { dockerImageName, gpuCount, gpuModel } = toolInfo;
  const [isAllOpen, setIsAllOpen] = useState(false);

  const jobSearchOptions = [
    { label: t('jobName.label'), value: 'name' },
    { label: t('dockerImage.label'), value: 'docker_image_name' },
    { label: t('datasets.label'), value: 'dataset_name' },
    { label: t('creator.label'), value: 'creator' },
  ];

  if (trainingType === 'advanced') {
    jobSearchOptions.push({ label: t('runCode.label'), value: 'run_code' });
  }

  const manualOpenHandler = (boolean) => {
    setIsAllOpen(boolean);
  };
  const jobList =
    jobListData &&
    jobListData.map((list, index) => (
      <JobList
        key={index}
        data={list}
        trainingInfo={trainingInfo}
        openDeleteConfirmPopup={openDeleteConfirmPopup}
        onSelect={onSelect}
        onViewLog={onViewJobLog}
        selectedRows={selectedRows}
        onStopJob={onStopJob}
        onStopJobs={onStopJobs}
        tid={tid}
        wid={wid}
        isAllOpen={isAllOpen}
        manualOpenHandler={manualOpenHandler}
      />
    ));

  let jobCount = 0;
  jobListData.map(({ jobs }) => {
    jobCount += jobs.length;
    return jobCount;
  });

  const usecaseList = [
    {
      title: t('job.usecase1.title.message'),
      description: t('job.usecase1.desc.message'),
      button: (
        <Button
          type='primary-light'
          onClick={onCreateJob}
          disabled={createBtnDisabled}
        >
          {t('createJob.label')}
        </Button>
      ),
    },
    {
      title: t('job.usecase2.title.message'),
      description: t('job.usecase2.desc.message'),
      button: (
        <Button
          type='primary-light'
          onClick={onCreateJob}
          disabled={createBtnDisabled}
        >
          {t('createJob.label')}
        </Button>
      ),
    },
    {
      title: t('job.usecase3.title.message'),
      description: t('job.usecase3.desc.message'),
      button: (
        <Button
          type='primary-light'
          onClick={onCreateJob}
          disabled={createBtnDisabled}
        >
          {t('createJob.label')}
        </Button>
      ),
    },
  ];

  /**
   * JOB 수정 모달 (리팩토링할 때 page로 이동)
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
          toolType: 2,
          toolId: toolInfo.toolId,
          trainingId: tid,
          workspaceId: wid,
        },
      }),
    );
  };

  return (
    <div className={cx('content')}>
      <div className={cx('title-box')}>
        <PageTitle>{trainingName}</PageTitle>
      </div>
      <div className={cx('job-box')}>
        <div className={cx('name-box')}>
          <div className={cx('icon')}>
            <img src='/images/icon/ic-job.svg' alt='JOB icon' />
          </div>
          <label className={cx('label')}>JOB</label>
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
            <Button
              type='primary'
              icon='/images/icon/00-ic-basic-plus-white.svg'
              iconAlign='left'
              onClick={onCreateJob}
              disabled={createBtnDisabled}
            >
              {t('createJob.label')}
            </Button>
          </div>
        </div>
      </div>
      <div className={cx('job-container')}>
        {jobList && totalJobRows > 0 && (
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
                          list={jobSearchOptions}
                          selectedItem={jobSearchKey}
                          onChange={onJobSearchKeyChange}
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
                        value={jobKeyword}
                        onChange={(e) => {
                          onJobSearch(e.target.value);
                        }}
                        onClear={() => onJobSearch('')}
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
          ) : totalJobRows === 0 ? (
            <div className={cx('empty-box')}>
              <div className={cx('left-box')}>
                <div className={cx('title')}>Queueing Experiments</div>
                <div className={cx('description')}>
                  {t('job.emptycase.desc.message')}
                </div>
                <div className={cx('img')}>
                  <img src='/images/icon/job-empty.png' alt='' />
                </div>
              </div>
              <div className={cx('right-box')}>
                <UsecaseList list={usecaseList} />
              </div>
            </div>
          ) : (
            <div className={cx('list-container')}>{jobList}</div>
          )}
          {!loading && totalJobRows !== 0 && jobList.length === 0 && (
            <div className={cx('no-result')}>
              <EmptyBox text={t('noSearchResult.message')} />
            </div>
          )}
        </div>
        {jobList && jobList.length > 0 && (
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

export default UserJobContent;
