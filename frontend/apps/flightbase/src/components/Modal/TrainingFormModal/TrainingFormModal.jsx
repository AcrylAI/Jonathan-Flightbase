import { useState, useRef } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import {
  Tooltip,
  InputText,
  Textarea,
  InputNumber,
  Selectbox,
  Badge,
} from '@jonathan/ui-react';
import Radio from '@src/components/atoms/input/Radio';
import MultiSelect from '@src/components/molecules/MultiSelect';
import InputBoxWithLabel from '@src/components/molecules/InputBoxWithLabel';
import BuiltInModelSelectBox from '@src/components/organisms/BuiltInModelSelectBox';
import GpuModelSelectBox from '@src/components/organisms/ResourceSettingBox/GpuModelSelectBox';
import CpuModelSelectBox from '@src/components/organisms/ResourceSettingBox/CpuModelSelectBox';
import ModalFrame from '../ModalFrame';

// CSS module
import classNames from 'classnames/bind';
import style from './TrainingFormModal.module.scss';
const cx = classNames.bind(style);

const IS_HIDE_SPECIFIC_GPU_MODEL =
  import.meta.env.VITE_REACT_APP_IS_HIDE_SPECIFIC_GPU_MODEL === 'true';
const IS_HIDE_SPECIFIC_CPU_MODEL =
  import.meta.env.VITE_REACT_APP_IS_HIDE_SPECIFIC_CPU_MODEL === 'true';

const filteringModelOptions = (
  builtInModelOptions,
  builtInFilter,
  trainingType,
  builtInModelSearchResult,
) => {
  if (builtInModelSearchResult?.length >= 0)
    builtInModelOptions = builtInModelSearchResult;
  return builtInModelOptions.filter(({ kind }) => {
    let flag = true;
    if (builtInFilter) {
      if (builtInFilter.value === 'all') {
        return flag;
      }
      flag = builtInFilter.value === kind && trainingType === 'built-in';
    } else {
      flag = trainingType === 'built-in';
    }
    return flag;
  });
};

function TrainingFormModal({
  validate,
  data,
  type,
  trainingType, // 선택된 프로젝트 타입 (training, training jupyter, service)
  trainingTypeOptions, // 프로젝트 타입 선택 옵션
  radioBtnHandler, // 프로젝트 타입 라디오 버튼 이벤트 핸들러
  trainingName, // 프로젝트 이름
  trainingNameError, // 프로젝트 이름 에러 텍스트
  trainingDesc, // 프로젝트 설명 텍스트
  trainingDescError, // 프로젝트 설명 에러 텍스트
  textInputHandler, // 텍스트 인풋 이벤트 핸들러
  numberInputHandler, // 넘버 인풋 이벤트 핸들러
  workspace, // 선택된 워크스페이스
  workspaceOptions, // 워크스페이스 옵션
  selectInputHandler, // 셀렉트 인풋 이벤트 핸들러
  gpuUsage, // gpu usage
  maxGpuUsageCountForRandom, // gpu usage 사용가능한 최대 갯수 (랜덤)
  gpuTotalCountForRandom, // gpu 총 갯수 (랜덤)
  maxGpuUsageCount, // gpu usage 사용가능한 최대 갯수
  minGpuUsage, // gpu usage 사용해야할 최소 갯수
  maxGpuUsage, // 반드시 넘으면 안되는 최대 GPU 수
  gpuTotalCount, // gpu 총 갯수
  isGuranteedGpu, // gpu 보장 여부
  gpuUsageError, // gpu usage 에러 텍스트
  dockerImageOptions, // docker Image 옵션
  dockerImage, // 선택된 docker Image
  gpuModelTypeOptions, // gpu model 타입 옵션
  gpuModelType, // 선택된 gpu model 타입
  cpuModelType, // 선택된 cpu model 타입
  gpuModelListOptions, // gpu model 리스트 옵션
  gpuModelList, // 선택된 gpu model 리 스트
  cpuModelList, // 선택된 cpu model 리스트
  cpuModelInfo,
  isMigModel, // 선택된 gpu model에 MIG 모델 포함 여부
  selectGpuModelHandler, // gpu model 리스트 핸들러
  accessTypeOptions, // access type 옵션
  accessType, // 선택된 access type
  ownerOptions, // owner 셀렉트 옵션
  owner, // 선택된 owner
  builtInFilterOptions,
  builtInFilter,
  builtInModel,
  builtInModelOptions,
  selectBuiltInModelHandler,
  multiSelectHandler, // 멀티 셀렉트 이벤트 핸들러
  trainingStatus,
  userList,
  selectedList,
  thumbnailList,
  onSubmit,
  permissionLevel,
  builtInModelSearchResult,
  onBuiltInModelSearch,
  modelTypeOptions,
  resourceTypeReadOnly,
  modelType,
  cpuModelTypeOptions,
  modelRadioBtnHandler,
  // ---- slider 관련 props ----
  //  gpu
  gpuSliderSwitch,
  gpuSelectedOptions,
  gpuDetailSelectedOptions,
  gpuTotalValue,
  gpuRamTotalValue,
  gpuDetailValue,
  gpuRamDetailValue,
  gpuTotalSliderMove,
  gpuSwitchStatus,
  gpuAndRamSliderValue,
  // cpu
  cpuSelectedOptions,
  detailSelectedOptions,
  cpuTotalValue,
  ramTotalValue,
  cpuDetailValue,
  ramDetailValue,
  cpuSliderMove,
  cpuSwitchStatus,
  cpuAndRamSliderValue,
  // slider func
  checkboxHandler,
  detailCpuValueHandler,
  detailGpuValueHandler,
  totalValueHandler,
  totalSliderHandler,
  sliderSwitchHandler,
}) {
  const [event, setEvent] = useState(false);
  const { t } = useTranslation();
  const { submit, cancel, workspaceId } = data;

  const newSubmit = {
    text: submit.text,
    func: async () => {
      setEvent(true);
      const res = await onSubmit(submit.func);
      return res;
    },
  };
  // const [setRef] = useObserver();

  const selectRef = useRef(null);

  return (
    <ModalFrame
      submit={newSubmit}
      cancel={cancel}
      type={type}
      validate={validate}
      isResize={true}
      isMinimize={true}
      title={
        type === 'CREATE_TRAINING'
          ? t('createTrainingForm.title.label')
          : t('editTrainingForm.title.label')
      }
      submitBtnTestId='create-training-btn'
    >
      <h2 className={cx('title')}>
        {type === 'CREATE_TRAINING'
          ? t('createTrainingForm.title.label')
          : t('editTrainingForm.title.label')}
      </h2>
      <div className={cx('form')}>
        <p className={cx('input-group-title')}>
          {t('basicInformationSettings.title.label')}
        </p>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('trainingName.label')}
            labelSize='large'
            errorMsg={t(trainingNameError)}
          >
            <InputText
              size='large'
              placeholder={t('trainingName.placeholder')}
              name='trainingName'
              value={trainingName}
              onChange={textInputHandler}
              onClear={() =>
                textInputHandler({
                  target: { name: 'trainingName', value: '' },
                })
              }
              status={trainingNameError ? 'error' : 'default'}
              isReadOnly={type === 'EDIT_TRAINING'}
              isLowercase
              options={{ maxLength: 50 }}
              autoFocus
              disableLeftIcon
              disableClearBtn={false}
              testId='training-name-input'
            />
          </InputBoxWithLabel>
        </div>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('trainingDescription.label')}
            optionalText={t('optional.label')}
            labelSize='large'
            optionalSize='large'
            errorMsg={t(trainingDescError)}
          >
            <Textarea
              size='large'
              placeholder={t('trainingDescription.placeholder')}
              value={trainingDesc}
              name='trainingDesc'
              onChange={textInputHandler}
              maxLength={1000}
              isShowMaxLength
              testId='training-desc-input'
              status={
                trainingDescError === null
                  ? ''
                  : trainingDescError === ''
                  ? 'success'
                  : 'error'
              }
              isReadOnly={permissionLevel < 2 && type === 'EDIT_TRAINING'}
            />
          </InputBoxWithLabel>
        </div>
        {!workspaceId && (
          <div className={cx('row')}>
            <InputBoxWithLabel
              labelText={t('workspace.label')}
              labelSize='large'
            >
              <Selectbox
                type='search'
                size='large'
                list={workspaceOptions}
                placeholder={t('workspace.placeholder')}
                selectedItem={workspace}
                onChange={(value) => {
                  selectInputHandler('workspace', value);
                }}
                isReadOnly={type === 'EDIT_TRAINING'}
                customStyle={{
                  fontStyle: {
                    selectbox: {
                      color: '#121619',
                      textShadow: 'None',
                    },
                  },
                }}
                scrollAutoFocus={true}
              />
            </InputBoxWithLabel>
          </div>
        )}
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('trainingType.label')}
            labelSize='large'
            disableErrorMsg={
              type === 'CREATE_TRAINING' && trainingType === 'built-in'
            }
          >
            <Radio
              options={trainingTypeOptions}
              name='trainingType'
              value={trainingType}
              testId='training-type-radio'
              onChange={(e) => {
                radioBtnHandler('trainingType', e.target.value);
              }}
              public={true}
              readOnly={trainingType === 'advanced'}
            />
          </InputBoxWithLabel>
        </div>
        {trainingType === 'built-in' && (
          <>
            {type === 'CREATE_TRAINING' && (
              <BuiltInModelSelectBox
                isTraining
                deploymentType={trainingType}
                builtInType={{ label: 'Default', value: 'default' }}
                builtInTypeOptions={null}
                builtInFilter={builtInFilter}
                builtInFilterOptions={builtInFilterOptions}
                modelOptions={filteringModelOptions(
                  builtInModelOptions,
                  builtInFilter,
                  trainingType,
                  builtInModelSearchResult,
                )}
                thumbnailList={thumbnailList}
                model={builtInModel}
                selectInputHandler={selectInputHandler}
                selectBuiltInModelHandler={selectBuiltInModelHandler}
                readOnly={type === 'EDIT_TRAINING'}
                onSearch={onBuiltInModelSearch}
                t={t}
              />
            )}
            {type === 'EDIT_TRAINING' && builtInModel && (
              <div className={cx('selected-model-box')}>
                <div className={cx('label')}>{t('trainingModel.label')}</div>
                <div className={cx('selected-model')}>
                  <div className={cx('image')}>
                    <img
                      className={cx(
                        builtInModel.thumbnailImageInfo
                          ? 'thumbnail'
                          : 'default',
                      )}
                      src={
                        builtInModel.thumbnailImageInfo
                          ? thumbnailList[builtInModel.id]
                          : '/images/icon/ic-built-in-blue.svg'
                      }
                      alt='built-in'
                    />
                  </div>
                  <div className={cx('text-box')}>
                    <div className={cx('model-name')}>{builtInModel.name}</div>
                    <div className={cx('desc')}>{builtInModel.desc}</div>
                  </div>
                  <div className={cx('badge')}>
                    {builtInModel?.enableCpu ||
                    builtInModel?.enableGpu ||
                    builtInModel?.multiGpuMode ? (
                      <>
                        <Badge
                          type={builtInModel?.enableCpu ? 'yellow' : 'disabled'}
                          title={builtInModel?.enableCpu ? 'Multi GPU' : ''}
                          label='CPU'
                          customStyle={{
                            marginLeft: '4px',
                            opacity: builtInModel?.enableCpu ? '1' : '0.2',
                          }}
                        />
                        <Badge
                          type={builtInModel?.enableGpu ? 'green' : 'disabled'}
                          title={builtInModel?.enableGpu ? 'Multi GPU' : ''}
                          label='GPU'
                          customStyle={{
                            marginLeft: '4px',
                            opacity: builtInModel?.enableGpu ? '1' : '0.2',
                          }}
                        />
                        <Badge
                          type={
                            builtInModel?.multiGpuMode ? 'blue' : 'disabled'
                          }
                          title={builtInModel?.multiGpuMode ? 'Multi GPU' : ''}
                          label='Multi'
                          customStyle={{
                            marginLeft: '4px',
                            opacity: builtInModel?.multiGpuMode ? '1' : '0.2',
                          }}
                        />
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {trainingType === 'advanced' && type !== 'EDIT_TRAINING' && (
          <div className={cx('row')}>
            <InputBoxWithLabel
              labelText={t('dockerImage.label')}
              labelSize='large'
            >
              <Selectbox
                type='search'
                size='large'
                list={dockerImageOptions}
                placeholder={t('dockerImage.placeholder')}
                selectedItem={dockerImage}
                onChange={(value) => {
                  selectInputHandler('dockerImage', value);
                }}
                isReadOnly={trainingStatus === 'running'}
                scrollAutoFocus={true}
                customStyle={{
                  fontStyle: {
                    selectbox: {
                      color: '#121619',
                      textShadow: 'None',
                    },
                  },
                }}
              />
            </InputBoxWithLabel>
          </div>
        )}
        {/** GPU모델 */}
        {type !== 'EDIT_TRAINING' && trainingType !== 'federated-learning' && (
          <>
            <div className={cx('row')}>
              <InputBoxWithLabel
                labelText={t('resourceType.label')}
                labelSize='large'
              >
                <Radio
                  options={modelTypeOptions}
                  name='modelTypeOptions'
                  value={modelType}
                  onChange={(e) => {
                    modelRadioBtnHandler(Number(e.target.value));
                  }}
                  customStyle={{ marginTop: '15px' }}
                  readOnly={resourceTypeReadOnly}
                />
              </InputBoxWithLabel>
              {modelType === 0 && !IS_HIDE_SPECIFIC_GPU_MODEL && (
                <InputBoxWithLabel
                  labelText={t('gpuModel.label')}
                  labelSize='large'
                  disableErrorMsg={gpuModelType === 1}
                >
                  <Radio
                    options={gpuModelTypeOptions}
                    name='gpuModelType'
                    value={gpuModelType}
                    onChange={(e) => {
                      radioBtnHandler('gpuModelType', e.target.value);
                    }}
                    customStyle={{ marginTop: '15px' }}
                  />
                </InputBoxWithLabel>
              )}
              {modelType === 1 && !IS_HIDE_SPECIFIC_CPU_MODEL && (
                <InputBoxWithLabel
                  labelText={t('cpuModel.label')}
                  labelSize='large'
                  disableErrorMsg={cpuModelType === 1}
                >
                  <Radio
                    options={cpuModelTypeOptions}
                    name='cpuModelType'
                    value={cpuModelType}
                    onChange={(e) => {
                      radioBtnHandler('cpuModelType', e.target.value);
                    }}
                    customStyle={{ marginTop: '15px' }}
                  />
                </InputBoxWithLabel>
              )}
            </div>
            {modelType === 0 &&
              gpuModelType === 1 && ( // GPU이면서 specific model
                <div className={cx('row')}>
                  <GpuModelSelectBox
                    // innerRef={setRef}
                    options={gpuModelListOptions}
                    onChange={selectGpuModelHandler}
                    cpuModelList={cpuModelList}
                    // ---- slider props
                    gpuSelectedOptions={gpuSelectedOptions}
                    gpuDetailSelectedOptions={gpuDetailSelectedOptions}
                    gpuTotalValue={gpuTotalValue}
                    gpuRamTotalValue={gpuRamTotalValue}
                    gpuDetailValue={gpuDetailValue}
                    gpuRamDetailValue={gpuRamDetailValue}
                    gpuTotalSliderMove={gpuTotalSliderMove}
                    gpuSwitchStatus={gpuSwitchStatus}
                    gpuAndRamSliderValue={gpuAndRamSliderValue}
                    totalValueHandler={totalValueHandler}
                    totalSliderHandler={totalSliderHandler}
                    sliderSwitchHandler={sliderSwitchHandler}
                    sliderSwitchStatus={gpuSliderSwitch}
                    detailGpuValueHandler={detailGpuValueHandler}
                    checkboxHandler={checkboxHandler}
                  />
                </div>
              )}
            {modelType === 1 && cpuModelType === 1 && (
              <div className={cx('row')}>
                <CpuModelSelectBox
                  options={cpuModelInfo}
                  event={event}
                  cpuSelectedOptions={cpuSelectedOptions}
                  detailSelectedOptions={detailSelectedOptions}
                  cpuTotalValue={cpuTotalValue}
                  ramTotalValue={ramTotalValue}
                  cpuDetailValue={cpuDetailValue}
                  ramDetailValue={ramDetailValue}
                  cpuSliderMove={cpuSliderMove}
                  cpuSwitchStatus={cpuSwitchStatus}
                  cpuAndRamSliderValue={cpuAndRamSliderValue}
                  checkboxHandler={checkboxHandler}
                  detailCpuValueHandler={detailCpuValueHandler}
                  totalValueHandler={totalValueHandler}
                  totalSliderHandler={totalSliderHandler}
                  sliderSwitchHandler={sliderSwitchHandler}
                />
              </div>
            )}
          </>
        )}
        {/** GPU 사용량 */}
        {type !== 'EDIT_TRAINING' &&
          trainingType !== 'federated-learning' &&
          modelType === 0 && (
            <div className={cx('row')}>
              <InputBoxWithLabel
                labelText={
                  modelType === 0 ? t('gpuUsage.label') : t('cpuUsage.label')
                }
                labelSize='large'
              >
                {modelType === 0 ? (
                  <InputNumber
                    placeholder={
                      gpuModelType === 0 ||
                      (gpuModelList && gpuModelList.length > 0)
                        ? t(
                            isGuranteedGpu
                              ? 'guaranteedGpuStatus.placeholder'
                              : 'gpuStatus.placeholder',
                            {
                              total:
                                gpuModelType === 0
                                  ? gpuTotalCountForRandom
                                  : gpuTotalCount,
                              free:
                                gpuModelType === 0
                                  ? maxGpuUsageCountForRandom
                                  : maxGpuUsageCount,
                            },
                          )
                        : t('gpuUsage.placeholder')
                    }
                    onChange={numberInputHandler}
                    name='gpuUsage'
                    value={gpuUsage}
                    testId='gpu-count-input'
                    status={
                      gpuUsageError === null
                        ? ''
                        : gpuUsageError === ''
                        ? 'success'
                        : 'error'
                    }
                    error={t(gpuUsageError)}
                    info={
                      gpuTotalCount < gpuUsage
                        ? t('gpuUsageOver.info.message')
                        : gpuModelType === 1
                        ? gpuModelList
                          ? isMigModel
                            ? t('gpuUsageMigModel.info.message')
                            : gpuModelList.length > 1 &&
                              t('gpuUsageMultiModel.info.message')
                          : null
                        : null
                    }
                    min={minGpuUsage}
                    max={maxGpuUsage}
                    isReadOnly={
                      !workspace ||
                      (gpuModelType === 1 &&
                        (!gpuModelList ||
                          gpuModelList.length === 0 ||
                          isMigModel))
                    }
                    size='large'
                    bottomTextExist={true}
                  />
                ) : (
                  <InputNumber
                    name='cpuUsage'
                    value={0}
                    isReadOnly={true}
                    size='large'
                  />
                )}
              </InputBoxWithLabel>
            </div>
          )}
        <p className={cx('input-group-title')}>
          {t('accessSettings.title.label')}
        </p>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('accessType.label')}
            labelSize='large'
            labelRight={
              <Tooltip
                title={t('trainingAccessType.tooltip.title')}
                contents={
                  <div>
                    <p>{t('trainingAccessType.tooltip1.message')}</p>
                    <p>{t('trainingAccessType.tooltip2.message')}</p>
                    <p>{t('trainingAccessType.tooltip3.message')}</p>
                  </div>
                }
                contentsAlign={{ vertical: 'top' }}
              />
            }
          >
            <Radio
              label='accessType.label'
              name='accessType'
              options={accessTypeOptions}
              value={accessType}
              onChange={(e) => {
                radioBtnHandler('accessType', e.target.value);
              }}
              readOnly={permissionLevel < 2 && type === 'EDIT_TRAINING'}
            />
          </InputBoxWithLabel>
        </div>
        <div ref={selectRef} className={cx('row')}>
          <InputBoxWithLabel labelText={t('owner.label')} labelSize='large'>
            <Selectbox
              type='search'
              size='large'
              list={ownerOptions}
              placeholder={t('owner.placeholder')}
              selectedItem={owner}
              onChange={(value) => {
                selectInputHandler('owner', value);
              }}
              isReadOnly={
                (permissionLevel < 2 && type === 'EDIT_TRAINING') || !workspace
              }
              customStyle={{
                fontStyle: {
                  selectbox: {
                    color: '#121619',
                    textShadow: 'None',
                  },
                },
              }}
              scrollAutoFocus={true}
            />
          </InputBoxWithLabel>
        </div>
        {accessType === 0 && (
          <div className={cx('row')}>
            <MultiSelect
              // innerRef={setRef}
              label='users.label'
              listLabel='availableUsers.label'
              selectedLabel='chosenUsers.label'
              list={userList} // 초기 목록
              selectedList={selectedList} // 초기 선택된 목록
              onChange={multiSelectHandler} // 변경 이벤트
              exceptItem={owner && owner.value} // 목록에서 빠질 아이템
              optional
              readOnly={permissionLevel < 2 && type === 'EDIT_TRAINING'}
            />
          </div>
        )}
      </div>
    </ModalFrame>
  );
}

export default TrainingFormModal;
