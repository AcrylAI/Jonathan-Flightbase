import { useState, useEffect, useRef, useCallback } from 'react';
import dayjs from 'dayjs';

// i18n
import { withTranslation } from 'react-i18next';

// Components
import {
  InputText,
  Switch,
  DateRangePicker,
  InputNumber,
  Selectbox,
  Textarea,
} from '@jonathan/ui-react';
import DateCell from '@src/components/atoms/DateCell';
import StorageSelect from '@src/components/Modal/WorkspaceFormModal/StorageSelect/StorageSelect';
import InputBoxWithLabel from '@src/components/molecules/InputBoxWithLabel';
import MultiSelect from '@src/components/molecules/MultiSelect';
import ModalFrame from '../ModalFrame';

// Utils
import { convertSizeTo } from '@src/utils';

// CSS module
import classNames from 'classnames/bind';
import style from './WorkspaceFormModal.module.scss';
const cx = classNames.bind(style);

const WorkspaceFormModal = ({
  inputHandler,
  numberInputHandler,
  switchHandler,
  calenderDetector,
  calenderMountDetector,
  calendarHandler,
  selectManager,
  multiSelectHandler,
  onSubmit,
  data,
  type,
  workspace,
  workspaceError,
  description,
  descriptionError,
  startdatetime,
  enddatetime,
  minDate,
  periodError,
  guarantee,
  trainingGpu,
  trainingGpuError,
  deploymentGpu,
  deploymentGpuError,
  manager,
  managerList,
  managerError,
  validate,
  userGroupOptions,
  selectedList,
  gpuCount,
  gpuTotal,
  gpuFreeMap,
  storageList,
  storageInputValue,
  storageBarData,
  storageError,
  storageMessage,
  storageSelectedModel,
  storageSelectHandler,
  storageInputHandler,
  prevStorageModel,
  editStorageAvailableSize,
  workspaceUsage,
  createStorageAvailableSize,
  t,
}) => {
  const { submit, cancel } = data;
  const scrollRef = useRef();

  const [storageBarState, setStorageBarState] = useState([]);
  const newSubmit = {
    text: submit.text,
    func: async () => {
      const res = await onSubmit(submit.func);
      return res;
    },
  };
  const scrollHandler = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const changeStorageBarData = useCallback(() => {
    if (storageSelectedModel?.share === 0 || prevStorageModel[0]?.share === 0) {
      let barData;
      let currUsage = 0;
      let editcurrUsage = 0;

      if (storageBarData.otherUsage) {
        currUsage = Math.ceil(
          Number(
            convertSizeTo(storageBarData.currUsage?.usage, 'GiB').split(
              ' GiB',
            )[0],
          ),
        );
        editcurrUsage = Math.ceil(
          Number(
            convertSizeTo(storageBarData.currUsage?.usage, 'GiB').split(
              ' GiB',
            )[0],
          ),
        );

        if (currUsage > storageInputValue) {
          currUsage = 0;
        } else {
          currUsage = storageInputValue - currUsage;
        }
      }

      if (storageBarData.otherUsage && type === 'EDIT_WORKSPACE') {
        let otherUsage = Number(
          convertSizeTo(storageBarData.otherUsage.usage, 'GiB')?.split(
            ' GiB',
          )[0],
        );

        let currUsageGib = Number(
          convertSizeTo(storageBarData.currUsage.usage, 'GiB')?.split(
            ' GiB',
          )[0],
        );

        let availableUsage = Number(
          convertSizeTo(prevStorageModel[0]?.size, 'GiB')?.split(' GiB')[0],
        );

        let availableUsageValue =
          availableUsage - (otherUsage + currUsageGib + storageInputValue);

        if (availableUsageValue < 0) {
          availableUsageValue = 0;
        }

        if (storageInputValue > currUsageGib) {
          editcurrUsage = storageInputValue - currUsageGib;
        } else {
          editcurrUsage = 0;
        }
        editcurrUsage = storageInputValue;
        let allocationUsageWidth =
          (storageInputValue /
            Number(
              convertSizeTo(prevStorageModel[0]?.size, 'GiB')?.split(' GiB')[0],
            )) *
          100;

        if (allocationUsageWidth !== 0) {
          if (allocationUsageWidth <= storageBarData.currUsage.pcent) {
            allocationUsageWidth = 0;
          } else if (allocationUsageWidth > storageBarData.currUsage.pcent) {
            allocationUsageWidth =
              allocationUsageWidth - storageBarData.currUsage.pcent;
          }
        }

        barData = [
          {
            title: 'storageOtherWorkspaceUsage.label',
            color: '#C1C1C1',
            width: storageBarData.otherUsage.pcent,
            usage: convertSizeTo(storageBarData.otherUsage.usage, 'GiB'),
          },
          {
            title: 'storageCurrUsage.label',
            color: '#2d76f8',
            width: storageBarData.currUsage.pcent,
            usage: convertSizeTo(storageBarData.currUsage.usage, 'GiB'),
          },
          {
            title: 'additionalAllocationCapacity.label',
            color: '#93BAFF',
            width: allocationUsageWidth,
            usage: editcurrUsage === '' ? 0 + ' GiB' : editcurrUsage + ' GiB',
          },
          {
            title: 'storageAvailableCapacity.label',
            color: '#FFFFFF',
            width: '',
            usage: availableUsageValue + ' GiB',
          },
        ];
      } else if (
        storageBarData.otherUsage &&
        type === 'CREATE_WORKSPACE' &&
        storageSelectedModel.share === 0
      ) {
        let availableUsage = Number(
          convertSizeTo(storageSelectedModel?.usage.size, 'GiB')?.split(
            ' GiB',
          )[0],
        );
        let otherUsage = Number(
          convertSizeTo(storageBarData.otherUsage.usage, 'GiB')?.split(
            ' GiB',
          )[0],
        );

        if (currUsage + otherUsage >= availableUsage) {
          if (currUsage > otherUsage) {
            currUsage = availableUsage - otherUsage;
          } else if (currUsage < otherUsage) {
            currUsage = otherUsage - currUsage;
          }
          availableUsage = 0;
        } else {
          availableUsage = availableUsage - (otherUsage + currUsage);
        }

        let allocationUsageWidth =
          (storageInputValue /
            Number(
              convertSizeTo(storageSelectedModel?.size, 'GiB')?.split(
                ' GiB',
              )[0],
            )) *
          100;

        barData = [
          {
            title: 'storageOtherWorkspaceUsage.label',
            color: '#C1C1C1',
            width: storageBarData.otherUsage.pcent,
            usage: storageBarData.otherUsage.usage,
          },
          {
            title: 'allocationCapacity.label',
            color: '#93BAFF',
            width: allocationUsageWidth,
            usage: currUsage + ' GiB',
          },
          {
            title: 'storageAvailableCapacity.label',
            color: '#FFFFFF',
            width: '',
            usage: availableUsage + 'GiB',
          },
        ];
      }

      setStorageBarState(barData);
    }
  }, [
    prevStorageModel,
    storageBarData,
    storageInputValue,
    storageSelectedModel,
    type,
  ]);

  useEffect(() => {
    changeStorageBarData();
  }, [storageBarData, prevStorageModel, changeStorageBarData]);

  return (
    <ModalFrame
      submit={newSubmit}
      cancel={cancel}
      type={type}
      validate={validate}
      isResize={true}
      isMinimize={true}
      title={
        type === 'CREATE_WORKSPACE'
          ? t('createWorkspaceForm.title.label')
          : t('editWorkspaceForm.title.label')
      }
    >
      <h2 className={cx('title')}>
        {type === 'CREATE_WORKSPACE'
          ? t('createWorkspaceForm.title.label')
          : t('editWorkspaceForm.title.label')}
      </h2>
      <div className={cx('form')}>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('workspaceName.label')}
            labelSize='large'
            errorMsg={t(workspaceError)}
          >
            <InputText
              size='large'
              placeholder={t('workspaceName.placeholder')}
              onChange={inputHandler}
              name='workspace'
              value={workspace}
              status={workspaceError ? 'error' : 'default'}
              isReadOnly={type === 'EDIT_WORKSPACE'}
              isLowercase
              options={{ maxLength: 50 }}
              autoFocus={true}
              disableLeftIcon
              disableClearBtn
            />
          </InputBoxWithLabel>
        </div>
        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('workspaceDescription.label')}
            optionalText={t('optional.label')}
            labelSize='large'
            optionalSize='large'
            errorMsg={t(descriptionError)}
          >
            <Textarea
              size='large'
              placeholder={t('workspaceDescription.placeholder')}
              value={description}
              name='description'
              onChange={inputHandler}
              error={descriptionError}
              status={descriptionError ? 'error' : 'default'}
              isShowMaxLength
            />
          </InputBoxWithLabel>
        </div>
        <div ref={scrollRef} className={cx('input-group')}>
          {/* <InputGrouping> */}
          <div className={cx('group-title')}>
            <span className={cx('text')}>
              {t('editGpuSettingForm.title.label')}
            </span>
            <Switch
              onChange={switchHandler}
              name='guarantee'
              checked={guarantee}
              label={
                guarantee
                  ? t('guaranteedGpuOnText.label')
                  : t('guaranteedGpuOffText.label')
              }
              labelAlign='right'
            />
          </div>
          <div className={cx('row')}>
            <div className={cx('calendar')}>
              <label>{t('periodOfUse.label')}</label>
              <DateRangePicker
                status={
                  periodError === null ? '' : periodError !== '' && 'error'
                }
                t={t}
                size='large'
                from={startdatetime.format('YYYY-MM-DD')}
                to={enddatetime.format('YYYY-MM-DD')}
                minDate={minDate.format('YYYY-MM-DD')}
                onSubmit={calendarHandler}
                onCellRender={(d, propItem) => {
                  return (
                    <DateCell
                      gpuFreeMap={gpuFreeMap}
                      d={dayjs(d)}
                      propItem={propItem}
                      gpuTotal={gpuTotal}
                    />
                  );
                }}
                cancelLabel='cancel.label'
                submitLabel='confirm.label'
                onCalendarMount={calenderMountDetector}
                onCalendarChangeDetector={calenderDetector}
                scrollHandler={scrollHandler}
              />
            </div>
          </div>
          <div className={cx('row')}>
            <div className={cx('number-input')}>
              <label>{t('gpusForTraining.label')}</label>
              <InputNumber
                size='large'
                name='trainingGpu'
                placeholder={`${t('availableGpu.label')} : ${
                  gpuCount - deploymentGpu
                }`}
                status={
                  trainingGpuError === null
                    ? ''
                    : trainingGpuError === ''
                    ? 'success'
                    : 'error'
                }
                error={trainingGpuError}
                value={trainingGpu ?? ''}
                min={0}
                max={gpuCount - deploymentGpu}
                onChange={numberInputHandler}
                t={t}
              />
              <span className={cx('error-info')}>
                {trainingGpuError && (
                  <span className={cx('error')}>{t(trainingGpuError)}</span>
                )}
              </span>
            </div>
          </div>
          <div className={cx('row')}>
            <div className={cx('number-input')}>
              <label>{t('gpusForDeployment.label')}</label>
              <InputNumber
                size='large'
                placeholder={`${t('availableGpu.label')} : ${
                  gpuCount - trainingGpu
                }`}
                name='deploymentGpu'
                value={deploymentGpu ?? ''}
                status={
                  deploymentGpuError === null
                    ? ''
                    : deploymentGpuError === ''
                    ? 'success'
                    : 'error'
                }
                error={deploymentGpuError}
                min={0}
                max={gpuCount - trainingGpu}
                onChange={numberInputHandler}
                t={t}
              />
              <span className={cx('error-info')}>
                {deploymentGpuError && (
                  <span className={cx('error')}>{t(deploymentGpuError)}</span>
                )}
              </span>
            </div>
          </div>
          {/* </InputGrouping> */}
        </div>
        {storageList?.length > 0 && (
          <div className={cx('row')}>
            <StorageSelect
              list={storageList}
              type={type}
              prevStorageModel={prevStorageModel}
              storageSelectHandler={storageSelectHandler}
              storageSelectedModel={storageSelectedModel}
              storageInputValue={storageInputValue}
              storageInputHandler={storageInputHandler}
              storageError={storageError}
              storageMessage={storageMessage}
              barData={storageBarState}
              storageBarData={storageBarData}
              editStorageAvailableSize={editStorageAvailableSize}
              createStorageAvailableSize={createStorageAvailableSize}
              workspaceUsage={workspaceUsage}
              t={t}
            />
            {/* <StorageUsageBar barData={barData} /> */}
          </div>
        )}
        <div className={cx('row')}></div>

        <div className={cx('row')}>
          <InputBoxWithLabel
            labelText={t('workspaceManager.label')}
            labelSize='large'
            errorMsg={t(managerError)}
          >
            <Selectbox
              type='search'
              size='large'
              list={managerList.map(({ id, name }) => ({
                label: name,
                value: id,
              }))}
              placeholder={t('workspaceManager.placeholder')}
              name='manager'
              selectedItem={manager}
              onChange={selectManager}
              status={managerError ? 'error' : 'default'}
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
        <div className={cx('row')}>
          <MultiSelect
            label='users.label'
            listLabel='availableUsers.label'
            selectedLabel='chosenUsers.label'
            list={userGroupOptions} // 초기 목록
            selectedList={selectedList} // 초기 선택된 목록
            onChange={multiSelectHandler} // 변경 이벤트
            exceptItem={manager && manager.value} // 목록에서 빠질 아이템
            optional
          />
        </div>
      </div>
    </ModalFrame>
  );
};

export default withTranslation()(WorkspaceFormModal);
