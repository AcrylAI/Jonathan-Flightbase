// Images
import arrowUp from '@src/static/images/icon/00-ic-basic-arrow-02-up-grey.svg';
import arrowDown from '@src/static/images/icon/00-ic-basic-arrow-02-down-grey.svg';
import builtInImage from '@src/static/images/icon/ic-built-in-blue.svg';
import customImage from '@src/static/images/icon/ic-custom-blue.svg';
// import fileImage from '@src/static/images/icon/file-white.svg';
import deleteImage from '@src/static/images/icon/delete.svg';
import plusImage from '@src/static/images/icon/00-ic-basic-plus-blue.svg';

// Components
import { Button, InputText, Badge } from '@jonathan/ui-react';
import SubMenu from '@src/components/molecules/SubMenu';
import TrainingTool from './TrainingTool';
// import SkeletonLine from '@src/components/atoms/SkeletonLine/SkeletonLine';
import CustomBottom from './CustomBottom';

// CSS Module
import classNames from 'classnames/bind';
import style from './TrainingType.module.scss';

const cx = classNames.bind(style);

function TrainingType({
  type,
  trainingList,
  trainingSelectedType,
  trainingSelectedOwner,
  trainingTypeSelectHandler,
  trainingSearch,
  trainingInputValue,
  trainingSortHandler,
  getJobList,
  tabClickHandler,
  getJobs,
  jobDetailList, // Object
  jobDetailOpenList, // Array
  toolDetailOpenHandler,
  jobList,
  hpsList,
  hpsDetailList,
  hpsDetailOpenList,
  trainingToolTab,
  trainingToolTabHandler,
  selectedTraining,
  selectedTool,
  selectedToolType,
  toolSelectHandler,
  trainingSelectHandler,
  trainingType,
  getCustomList,
  paramsInputHandler,
  customFile,
  customParam,
  customRuncode,
  runcodeClickHandler,
  variablesAdd,
  variablesDelete,
  variablesValues,
  variableInputHandler,
  variablesSortHandler,
  customSearchValue,
  customLan,
  hpsLogTable,
  selectedHpsScore,
  selectedHps,
  customList,
  toolSortHandler,
  toolSearchValue,
  toolSelectedOwner,
  customListStatus,
  hpsLogSortHandler,
  selectedTrainingData,
  selectedHpsId,
  selectedLogId,
  logClickHandler,
  toolModelSearchValue,
  toolModelSortHandler,
  hpsModelList,
  jobModelList,
  jobModelSelectValue,
  hpsModelSelectValue,
  toolModelSelectHandler,
  trainingTypeArrow,
  trainingTypeArrowHandler,
  editStatus,
  readOnly,
  t,
}) {
  const userName = sessionStorage.getItem('user_name');
  const typeMenuOptions = [{ label: 'Custom', value: 'custom' }];
  const ownerMenuOptions = [
    { label: 'all.label', value: 'allOwner' },
    { label: 'owner', value: 'owner' },
  ];
  const toolOwnerOptions = [
    { label: 'all.label', value: 'toolAll' },
    { label: 'owner', value: 'toolOwner' },
  ];

  return (
    <div className={cx('training-box')}>
      <div
        className={cx(
          'tab',
          !trainingTypeArrow.train && 'close',
          readOnly ? 'readOnly' : 'editable',
          !selectedTraining && 'no-selected',
        )}
        onClick={() => {
          if (!editStatus) {
            trainingTypeArrowHandler('train');
          }
        }}
      >
        <div className={cx('title')}>{t('training.label')}</div>
        <div className={cx('content', selectedTraining && 'selected-content')}>
          {selectedTraining
            ? selectedTraining
            : t('deploymentTrainingSelect.label')}
        </div>
        <div className={cx('arrow-train')}>
          <img
            src={trainingTypeArrow.train ? arrowUp : arrowDown}
            alt='arrow'
          />
        </div>
      </div>
      {trainingTypeArrow.train && (
        <>
          <div className={cx('train-content')}>
            <div className={cx('input')}>
              <InputText
                value={trainingInputValue}
                onChange={(e) => trainingSortHandler({ e })}
                disableLeftIcon={false}
                placeholder={t('deploymentInputNameDesc.placeholder')}
              />
            </div>
            <div className={cx('button-box', userName === 'root' && 'admin')}>
              <div className={cx('button')}>
                <span className={cx('type-title')}>{t('type.label')}</span>
                <SubMenu
                  option={typeMenuOptions}
                  select={trainingSelectedType}
                  onChangeHandler={(e) => {
                    trainingSortHandler({ selectedItem: e });
                  }}
                  customStyle={{ marginBottom: 0, marginRight: 0 }}
                  size={'small'}
                />
              </div>
              {userName !== 'root' && (
                <div className={cx('button')}>
                  <span className={cx('type-title')}>{t('owner.label')}</span>
                  <SubMenu
                    option={ownerMenuOptions}
                    select={trainingSelectedOwner}
                    onChangeHandler={(e) => {
                      trainingSortHandler({ selectedItem: e });
                    }}
                    customStyle={{ marginBottom: 0, marginRight: 0 }}
                    size={'small'}
                  />
                </div>
              )}
            </div>
          </div>
          <div className={cx('train-list')}>
            {trainingList?.usertrained_training_list &&
            trainingList?.usertrained_training_list.length > 0 ? (
              trainingList.usertrained_training_list.map((list, idx) => {
                return (
                  <div
                    className={cx(
                      list.enable_to_deploy_with_cpu ||
                        list.enable_to_deploy_with_gpu ||
                        list.deployment_multi_gpu_mode
                        ? 'mode-box'
                        : 'list-box',
                      selectedTraining === list.training_name &&
                        'selected-train',
                    )}
                    key={idx}
                    onClick={() => {
                      trainingTypeArrowHandler('train');
                      if (selectedTraining !== list.training_name) {
                        getJobList(list, list.training_name);
                        if (list.training_type === 'advanced') {
                          getCustomList(list);
                        }
                      }
                    }}
                  >
                    <div className={cx('image')}>
                      <img
                        className={cx(list.is_thumbnail === 1 && 'img')}
                        src={
                          list.is_thumbnail === 0
                            ? list.training_type === 'built-in'
                              ? builtInImage
                              : customImage
                            : trainingList.built_in_model_thumbnail_image_info[
                                list.built_in_model_id
                              ]
                        }
                        alt='type'
                      />
                    </div>
                    <div className={cx('name-box')}>
                      <div className={cx('name-desc')}>
                        <span className={cx('name')}>{list.training_name}</span>
                        {list.built_in_model_name && (
                          <>
                            <span className={cx('model')}>
                              {list.built_in_model_name}
                            </span>
                          </>
                        )}
                        <span className={cx('desc')}>
                          {list.training_description}
                        </span>
                      </div>
                    </div>
                    {(list.enable_to_deploy_with_cpu ||
                      list.enable_to_deploy_with_gpu ||
                      list.deployment_multi_gpu_mode) && (
                      <div className={cx('badge')}>
                        <Badge
                          type={
                            list.enable_to_deploy_with_cpu
                              ? 'yellow'
                              : 'disabled'
                          }
                          title={
                            list.enable_to_deploy_with_cpu ? 'Multi GPU' : ''
                          }
                          label='CPU'
                          customStyle={{
                            marginLeft: '4px',
                            opacity: list.enable_to_deploy_with_cpu
                              ? '1'
                              : '0.2',
                          }}
                        />
                        <Badge
                          type={
                            list.enable_to_deploy_with_gpu
                              ? 'green'
                              : 'disabled'
                          }
                          title={
                            list.enable_to_deploy_with_gpu ? 'Multi GPU' : ''
                          }
                          label='GPU'
                          customStyle={{
                            marginLeft: '4px',
                            opacity: list.enable_to_deploy_with_gpu
                              ? '1'
                              : '0.2',
                          }}
                        />
                        <Badge
                          type={list.isDeploymentMultiGpu ? 'blue' : 'disabled'}
                          title={
                            list.deployment_multi_gpu_mode ? 'Multi GPU' : ''
                          }
                          label='Multi'
                          customStyle={{
                            marginLeft: '4px',
                            opacity: list.deployment_multi_gpu_mode
                              ? '1'
                              : '0.2',
                          }}
                        />
                      </div>
                    )}

                    <div className={cx('owner')}>{list.training_user_name}</div>
                    <div
                      className={cx(
                        list.training_bookmark === 1
                          ? 'bookmark'
                          : 'empty-bookmark',
                      )}
                      name={t('bookmark.label')}
                    ></div>
                  </div>
                );
              })
            ) : (
              <div className={cx('empty')}>{t('noData.message')}</div>
            )}
          </div>
        </>
      )}
      {selectedTraining && trainingType === 'built-in' && (
        <TrainingTool
          type={type}
          trainingToolTab={trainingToolTab}
          trainingToolTabHandler={trainingToolTabHandler}
          hpsList={hpsList}
          jobList={jobList}
          toolDetailOpenHandler={toolDetailOpenHandler}
          jobDetailOpenList={jobDetailOpenList}
          jobDetailList={jobDetailList}
          toolSelectHandler={toolSelectHandler}
          hpsDetailOpenList={hpsDetailOpenList}
          hpsDetailList={hpsDetailList}
          trainingType={trainingType}
          trainingInputValue={trainingInputValue}
          trainingSortHandler={trainingSortHandler}
          toolOwnerOptions={toolOwnerOptions}
          trainingSelectedOwner={trainingSelectedOwner}
          selectedTool={selectedTool}
          selectedToolType={selectedToolType}
          customParam={customParam}
          customFile={customFile}
          paramsInputHandler={paramsInputHandler}
          runcodeClickHandler={runcodeClickHandler}
          getJobs={getJobs}
          hpsLogTable={hpsLogTable}
          selectedHpsScore={selectedHpsScore}
          selectedHps={selectedHps}
          toolSortHandler={toolSortHandler}
          toolSearchValue={toolSearchValue}
          toolSelectedOwner={toolSelectedOwner}
          customListStatus={customListStatus}
          hpsLogSortHandler={hpsLogSortHandler}
          selectedHpsId={selectedHpsId}
          selectedLogId={selectedLogId}
          logClickHandler={logClickHandler}
          selectedTrainingData={selectedTrainingData}
          toolModelSearchValue={toolModelSearchValue}
          toolModelSortHandler={toolModelSortHandler}
          hpsModelList={hpsModelList}
          jobModelList={jobModelList}
          jobModelSelectValue={jobModelSelectValue}
          hpsModelSelectValue={hpsModelSelectValue}
          toolModelSelectHandler={toolModelSelectHandler}
          trainingTypeArrow={trainingTypeArrow}
          editStatus={editStatus}
          trainingTypeArrowHandler={trainingTypeArrowHandler}
          userName={userName}
          t={t}
          readOnly={readOnly}
        />
      )}
      {selectedTraining && trainingType === 'advanced' && (
        <>
          <div
            className={cx(
              'custom-search-box',
              readOnly ? 'readOnly' : 'editable',
            )}
            onClick={() => {
              if (!editStatus) {
                trainingTypeArrowHandler('variable');
              }
            }}
          >
            <div className={cx('search-title')}>
              {t('deploymentTypeRunCommand.label')}
            </div>
            <div className={cx('input-box')}>
              <div className={cx('row')}>
                <div
                  className={cx('first-input')}
                  onClick={(e) => e.stopPropagation()}
                >
                  <InputText
                    value={customLan}
                    onChange={(e) => paramsInputHandler({ e, type: 'lan' })}
                    disableLeftIcon={true}
                    placeholder={t('deploymentInputPackage.placeholder')}
                    isReadOnly={editStatus}
                  />
                </div>
                <div
                  className={cx('second-input')}
                  onClick={(e) => e.stopPropagation()}
                >
                  <InputText
                    value={customFile}
                    onChange={(e) => paramsInputHandler({ e, type: 'file' })}
                    disableLeftIcon={true}
                    placeholder={t('deploymentInputFile.placeholder')}
                    isReadOnly={editStatus}
                  />
                </div>
              </div>
              <div className={cx('row')}>
                <div
                  className={cx('third-input')}
                  onClick={(e) => e.stopPropagation()}
                >
                  <InputText
                    value={customParam}
                    onChange={(e) => paramsInputHandler({ e, type: 'param' })}
                    disableLeftIcon={true}
                    placeholder={t('deploymentInputParam.placeholder')}
                    isDisabled={editStatus}
                    options={{ width: '100%' }}
                    customStyle={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
            <div className={cx('image')}>
              <img
                className={cx('img')}
                src={trainingTypeArrow.variable ? arrowUp : arrowDown}
                alt='type'
              />
            </div>
          </div>
          {trainingTypeArrow.variable && (
            <>
              <div className={cx('custom-mid')}>
                <div className={cx('custom-input')}>
                  <InputText
                    value={customSearchValue}
                    onChange={(e) => variablesSortHandler({ e })}
                    disableLeftIcon={false}
                    options={{ width: '100%' }}
                    customStyle={{ width: '100%' }}
                    placeholder={t('deploymentInputNameDesc.placeholder')}
                    isDisabled={editStatus}
                  />
                </div>
              </div>
              <CustomBottom
                customList={customList}
                // customList={Array.from({ length: 1000000 }, () => 1)}
                customListStatus={customListStatus}
                runcodeClickHandler={runcodeClickHandler}
                customFile={customFile}
              />
            </>
          )}
          <div
            className={cx(
              'variables-box',
              !trainingTypeArrow.variable && 'close',
              readOnly ? 'readOnly' : 'editable',
            )}
          >
            <div className={cx('variables-title')}>
              {t('deploymentParams.label')}
            </div>
            <div className={cx('input-box')}>
              <div className={cx('input')}>
                {variablesValues.map((v, i) => {
                  return (
                    <div className={cx('input-col')} key={i}>
                      <div className={cx('first-input')}>
                        <InputText
                          value={v.name}
                          onChange={(e) =>
                            variableInputHandler({ e, idx: i, key: 'key' })
                          }
                          disableLeftIcon={true}
                          placeholder={t('deploymentInputKey.placeholder')}
                          isReadOnly={editStatus}
                        />
                      </div>
                      <div className={cx('second-input')}>
                        <InputText
                          value={v.value}
                          onChange={(e) =>
                            variableInputHandler({ e, idx: i, key: 'value' })
                          }
                          disableLeftIcon={true}
                          placeholder={t('deploymentInputValue.placeholder')}
                          isReadOnly={editStatus}
                        />
                      </div>
                      <div
                        className={cx('image')}
                        onClick={() => {
                          if (!editStatus) variablesDelete(i);
                        }}
                      >
                        <img
                          className={cx('img', editStatus && 'img-disable')}
                          src={deleteImage}
                          alt='type'
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={cx('btn')}>
                <Button
                  type='primary-reverse'
                  customStyle={{
                    border: 'none',
                    color: '#5089f0',
                    backgroundColor: '#f5f7fb',
                    paddingRight: '5px',
                    cursor: editStatus && 'not-allowed',
                  }}
                  icon={plusImage}
                  iconAlign='left'
                  onClick={() => {
                    if (!editStatus) variablesAdd();
                  }}
                  iconStyle={{
                    width: '14px',
                    height: '14px',
                    marginRight: '2px',
                  }}
                >
                  {t('deploymentAddParams.label')}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TrainingType;
