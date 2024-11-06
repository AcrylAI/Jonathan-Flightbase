import { useSelector } from 'react-redux';

// Icons
import rightIcon from '@images/icon/ic-exclamation.svg';

// Atom
import {
  Checkbox,
  InputNumber,
  InputText,
  Radio,
  Selectbox,
  StatusCard,
} from '@jonathan/ui-react';

// CSS Module
import className from 'classnames/bind';
import style from './RoundModalContents.module.scss';

const cx = className.bind(style);

function RoundModalContents(contentProps) {
  const { theme } = useSelector(({ theme }) => theme);
  const {
    seedModelData,
    trainingData,
    aggregationData,
    clientList,
    changeSeedModel,
    changeTrainingHyperParameters,
    changeSelectedClient,
    selectedClientCheckbox,
    changeTotalRoundCount,
    defaultSelectedRound,
    trainingHyperParameter,
    changeAggregationData,
    aggregationCheckedValue,
    changeAggregationMethodHandler,
    changeHpsMethodHandler,
    hpsMethod,
    changeHpsCountHandler,
    t,
  } = contentProps;

  const LocalModelOptions = [
    {
      label: 'Latest',
      value: 0,
      disabled: false,
      labelStyle: { fontSize: '13px' },
    },
    {
      label: 'Best',
      value: 1,
      disabled: true,
      labelStyle: { fontSize: '13px' },
    },
  ];

  const AggregationMethodOptions = [
    {
      label: 'Hyper Parameter Search',
      value: 0,
      disabled: false,
      labelStyle: { fontSize: '13px' },
    },
    {
      label: 'Custom Parameters',
      value: 1,
      disabled: false,
      labelStyle: { fontSize: '13px' },
    },
  ];

  const HPSMethodOptions = [
    {
      label: 'Beysian',
      value: 0,
      disabled: false,
      labelStyle: { fontSize: '13px' },
    },
    {
      label: 'Random',
      value: 1,
      disabled: false,
      labelStyle: { fontSize: '13px' },
    },
  ];

  const BroadcastingOptions = [
    {
      label: t('roundCreate.autoBroadcast.label'),
      value: 0,
      disabled: false,
      labelStyle: { fontSize: '13px' },
    },
    {
      label: t('roundCreate.manualBroadcast.label'),
      value: 1,
      disabled: true,
      labelStyle: { fontSize: '13px' },
    },
  ];

  return (
    <div className={cx('container')}>
      <div className={cx('top-title')}>
        {t('roundCreate.clientTrainingStage.label')}
      </div>
      <div className={cx('label')}>{t('round.seedModel.label')}</div>
      <div>
        {seedModelData && (
          <Selectbox
            theme={theme}
            list={seedModelData}
            onChange={changeSeedModel}
            selectedItem={defaultSelectedRound}
            isReadOnly={seedModelData.length < 1}
            placeholder={t('roundCreate.noPreviousRound.message')}
            customStyle={{
              fontStyle: {
                selectbox: {
                  fontSize: '13px',
                },
                list: {
                  fontSize: '13px',
                },
              },
            }}
          />
        )}
      </div>
      <div className={cx('title')}>
        {t('roundCreate.trainingHyperParameter.label')}
      </div>
      <div className={cx('training-title')}>
        <span className={cx('first-title')}>{t('roundCreate.key.label')}</span>
        <span className={cx('second-title')}>
          {t('roundCreate.value.label')}
        </span>
      </div>
      {trainingData?.map((data) => (
        <div key={data.key} className={cx('training-value-container')}>
          <div className={cx('first-value')}>
            <InputText
              theme={theme}
              isReadOnly={true}
              disableClearBtn
              disableLeftIcon
              value={data.key}
            />
            <div className={cx('second-value')}>
              {data.description && (
                <div className={cx('parameter-explantaion')}>
                  <img className={cx('image')} src={rightIcon} alt='right' />
                  <div className={cx('image_under')}>{data.description}</div>
                </div>
              )}
            </div>
          </div>
          <InputText
            theme={theme}
            disableClearBtn
            disableLeftIcon
            value={trainingHyperParameter[data.key]}
            customStyle={{ width: '19rem' }}
            placeholder='Input value here'
            onChange={(e) => changeTrainingHyperParameters(data.key, e)}
          />
        </div>
      ))}
      <div className={cx('title')}>
        {t('roundCreate.ClientsParticipation.label')}
      </div>
      <div>
        <div className={cx('clients-title')}>
          <span className={cx('first-title')}>{t('clients.label')}</span>
          <span className={cx('second-title')}>
            {t('roundCreate.ready.table.label')}
          </span>
          <span className={cx('third-title')}>
            {t('roundCreate.Participate.label')}
          </span>
        </div>
        {clientList?.map((data, idx) => (
          <div key={data.clients} className={cx('client-table')}>
            <div className={cx('first-column')}>{data.name}</div>
            <div className={cx('second-column')}>
              <StatusCard
                theme={theme}
                status={data.ready ? 'connected' : 'disconnected'}
                text={
                  data.ready
                    ? 'roundCreate.ready.label'
                    : 'roundCreate.notReady.label'
                }
                customStyle={{ width: 'max-content' }}
                size='small'
                t={t}
              />
            </div>
            <div className={cx('third-column')}>
              <Checkbox
                checked={selectedClientCheckbox[idx]}
                theme={theme}
                disabled={!data.ready}
                onChange={() => changeSelectedClient(idx, data)}
              />
            </div>
          </div>
        ))}
      </div>
      <div>
        <div className={cx('mid-title')}>
          {t('roundCreate.aggregationStage.label')}
        </div>
        <div className={cx('radio-label')}>
          {t('roundCreate.localModelSelection.label')}
        </div>
        <Radio
          selectedValue={0}
          theme={theme}
          options={LocalModelOptions}
          customStyle={{ marginBottom: '26px', transform: 'translateX(-6px)' }}
        />
        <div className={cx('radio-label')}>
          {t('roundCreate.AggregationMethod.label')}
        </div>
        <Radio
          selectedValue={aggregationCheckedValue}
          theme={theme}
          options={AggregationMethodOptions}
          onChange={(e) => changeAggregationMethodHandler(e)}
          defaultChecked={0}
          customStyle={{
            marginBottom: '26px',
            transform: 'translateX(-6px)',
          }}
        />
        {aggregationCheckedValue === 1 ? (
          <div>
            <div className={cx('title')}>
              {t('roundCreate.aggregationHyperParameter.label')}
            </div>
            <div className={cx('training-title')}>
              <span className={cx('first-title')}>
                {t('roundCreate.key.label')}
              </span>
              <span className={cx('second-title')}>
                {t('roundCreate.value.label')}
              </span>
            </div>

            {aggregationData?.map((data) => (
              <div key={data.key} className={cx('training-value-container')}>
                <div className={cx('first-value')}>
                  <InputText
                    theme={theme}
                    isReadOnly={true}
                    disableClearBtn
                    disableLeftIcon
                    value={data.key}
                    customStyle={{ width: '9rem' }}
                  />
                  <div className={cx('second-value')}>
                    {data.description && (
                      <div className={cx('parameter-explantaion')}>
                        <img
                          className={cx('image')}
                          src={rightIcon}
                          alt='right'
                        />
                        <div className={cx('image_under')}>
                          {data.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <InputText
                  theme={theme}
                  disableClearBtn
                  disableLeftIcon
                  value={(data.defaultValue && data.defaultValue) || ''}
                  customStyle={{ width: '19rem' }}
                  placeholder='Input value here'
                  onChange={(e) => changeAggregationData(e, data)}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className={cx('radio-label')}>
              {t('roundCreate.hpsMethod.label')}
            </div>
            <Radio
              selectedValue={hpsMethod}
              theme={theme}
              options={HPSMethodOptions}
              customStyle={{
                marginBottom: '26px',
                transform: 'translateX(-6px)',
              }}
              onChange={changeHpsMethodHandler}
            />
            <div className={cx('radio-label')}>
              {t('roundCreate.hpsCount.label')}
            </div>
            <InputNumber
              placeholder='10'
              customSize={{ width: '10rem' }}
              onChange={changeHpsCountHandler}
              theme={theme}
              disableIcon={true}
            />
          </>
        )}
        <div className={cx('last-title')}>
          {t('roundCreate.broadcasting.label')}
        </div>
        <Radio
          selectedValue={0}
          theme={theme}
          options={BroadcastingOptions}
          customStyle={{
            marginBottom: '26px',
            transform: 'translateX(-6px)',
          }}
        />
        <div className={cx('radio-label')}>
          {t('roundCreate.autoStartNextRound.label')}
        </div>
        <p className={cx('next-round-explanation')}>
          {t('roundCreate.TotalRoundCount.label')}
        </p>
        <InputNumber
          placeholder='1'
          customSize={{ width: '10rem' }}
          onChange={changeTotalRoundCount}
          theme={theme}
          disableIcon={true}
        />
      </div>
    </div>
  );
}
export default RoundModalContents;
