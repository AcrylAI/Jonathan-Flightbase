import { useState, useEffect } from 'react';

// Component
// import { StatusCard } from '@jonathan/ui-react';
import Slider from '@src/components/uiContents/Slider';

// Utils
import { convertByte } from '@src/utils/utils';

import style from './StageSpace.module.scss';
import classNames from 'classnames/bind';
import { StatusCard } from '@jonathan/ui-react';
const cx = classNames.bind(style);
const RANDOM = 'Random';
const BEYSIAN = 'Beysian';

function StageSpace({ t, stageData, currStatus }) {
  const [stageId, setStageId] = useState(0);
  const clientTraining = stageData?.info.training;
  const aggregation = stageData?.info.aggregation;
  const broadcasting = stageData?.info.broadcasting;
  const {
    aggregation_method,
    hyperparameter_search_item_list,
    hyperparameter_search,
  } = stageData.info.aggregation;

  useEffect(() => {
    setStageId(0);
  }, [stageData?.round_name]);

  useEffect(() => {
    switch (currStatus) {
      case 4:
        setStageId(0);
        break;
      case 1:
        setStageId(0);
        break;
      case 2:
        setStageId(1);
        break;
      case 3:
        setStageId(2);
        break;
      default:
        break;
    }
  }, [currStatus]);

  const onPressArrowHandler = (id) => {
    setStageId(id);
  };

  return (
    <>
      <Slider
        onPressArrowHandler={(id) => onPressArrowHandler(id)}
        names={[
          t('round.clientTrainingStage.label'),
          t('round.aggregationStage.label'),
          t('round.broadcastingStage.label'),
        ]}
        stageId={stageId}
        status={stageData?.status}
        currStatus={currStatus}
      >
        <div className={cx('contents')}>
          <div className={cx('text-filed', 'title-box')}>
            <p className={cx('text-title', 'no-margin')}>
              {t('round.runTimeInfo.label')}
            </p>
          </div>
          {stageId === 0 && (
            <>
              <div className={cx('text-filed')}>
                <p className={cx('text-key')}>
                  {t('round.stageStarted.label')}
                </p>
                <p className={cx('text-contents')}>
                  {clientTraining?.stage_start_datetime}
                </p>
              </div>
              <div className={cx('text-filed')}>
                <p className={cx('text-key')}>{t('round.seedModel.label')}</p>
                <p className={cx('text-contents')}>
                  {clientTraining?.seed_model_round_name
                    ? t('round.version.label', {
                        version: clientTraining?.seed_model_round_name,
                      })
                    : '-'}
                </p>
              </div>
              <div className={cx('text-filed')}>
                <p className={cx('text-key')}>
                  {t('round.hyperParameters.label')}
                </p>
                <p className={cx('text-contents', 'parameters')}>
                  {clientTraining &&
                    Object.keys(clientTraining?.hyperparameter).map(
                      (entrie, idx) => {
                        return (
                          <span key={idx}>
                            {entrie}&nbsp;:&nbsp;&nbsp;
                            {clientTraining?.hyperparameter[entrie]}
                          </span>
                        );
                      },
                    )}
                </p>
              </div>
              <div className={cx('text-filed')}>
                <p className={cx('text-key')}>
                  {t('round.localModelSelection.label')}
                </p>
                <p className={cx('text-contents')}>
                  {clientTraining?.local_model_selection === 0
                    ? 'Latest'
                    : 'Best'}
                </p>
              </div>
            </>
          )}
          {stageId === 1 && (
            <>
              <div className={cx('text-filed')}>
                <p className={cx('text-key')}>{t('round.staged.label')}</p>
                <p className={cx('text-contents')}>
                  {aggregation?.stage_start_datetime || '-'}
                </p>
              </div>
              <div className={cx('text-filed')}>
                <p className={cx('text-key')}>{t('round.stageMethod.label')}</p>
                <p className={cx('text-contents')}>
                  {aggregation?.aggregation_method === 0
                    ? 'Hyper Parameter Search'
                    : 'Custom Parameters'}
                </p>
              </div>

              {aggregation_method === 0 ? (
                <>
                  <div className={cx('text-filed', 'title-box')}>
                    <p className={cx('text-title')}>
                      {t('round.hpsInfo.label')}
                    </p>
                  </div>
                  <div className={cx('text-filed')}>
                    <p className={cx('text-key')}>
                      {t('round.hpsMethod.label')}
                    </p>
                    <p className={cx('text-contents')}>
                      {hyperparameter_search.info.method ? RANDOM : BEYSIAN}
                    </p>
                  </div>
                  <div className={cx('text-filed')}>
                    <p className={cx('text-key')}>
                      {t('round.hpsCount.label')}
                    </p>
                    <p className={cx('text-contents')}>
                      {hyperparameter_search.info.count}
                    </p>
                  </div>
                  {hyperparameter_search_item_list.length > 0 && (
                    <div className={cx('text-filed', 'no-border')}>
                      <p className={cx('text-title')}>
                        {t('round.hpsCreated.label')}
                      </p>
                    </div>
                  )}
                  {hyperparameter_search_item_list.map((data) => (
                    <div key={data.id} className={cx('created-hps-box')}>
                      <div className={cx('status-box')}>
                        <p className={cx('progress')}>
                          ({data.id}/{data.hps_total_count})
                        </p>
                        <div>
                          {data.best && (
                            <StatusCard
                              text='Best'
                              status='running'
                              theme='jp-dark'
                              size='small'
                            />
                          )}
                        </div>
                      </div>
                      <div className={cx('score-box')}>
                        <p>Score</p>
                        <p className={cx('value')}>{data.target.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className={cx('text-filed')}>
                  <p className={cx('text-key')}>Custom Parameters</p>
                  <p className={cx('text-contents', 'parameters')}>
                    {aggregation?.custom &&
                      Object.keys(
                        aggregation.custom?.aggregation_custom_parameter,
                      ).map((entrie, idx) => {
                        return (
                          <span key={idx}>
                            {entrie}&nbsp;:&nbsp;&nbsp;
                            {
                              aggregation.custom.aggregation_custom_parameter[
                                entrie
                              ]
                            }
                          </span>
                        );
                      })}
                  </p>
                </div>
              )}
            </>
          )}
          {stageId === 2 && (
            <>
              <div className={cx('text-filed')}>
                <p className={cx('text-key')}>
                  {t('model.table.created.label')}
                </p>
                <p className={cx('text-contents')}>
                  {broadcasting?.global_model_create_datetime || '-'}
                </p>
              </div>
              <div className={cx('text-filed')}>
                <p className={cx('text-key')}>{t('round.size.label')}</p>
                <p className={cx('text-contents')}>
                  {broadcasting?.global_model_size
                    ? convertByte(broadcasting.global_model_size)
                    : '-'}
                </p>
              </div>
              <div className={cx('text-filed', 'title-box')}>
                <p className={cx('text-title')}>{t('metrics.label')}</p>
                <div className={cx('row-contents')}>
                  <p className={cx('text-title')}>
                    {t('round.seedModel.label')}
                  </p>
                  <p className={cx('text-title')}>
                    {t('roundDetail.tab.resultModel.label')}
                  </p>
                </div>
              </div>
              {broadcasting?.metrics.map((data, idx) => (
                <div className={cx('text-filed')} key={idx}>
                  <p className={cx('text-key')}>{data.metric}</p>
                  <div className={cx('row-contents')}>
                    <p className={cx('text-contents')}>{data.seed_model}</p>
                    <p className={cx('text-contents')}>{data.global_model}</p>
                  </div>
                </div>
              ))}
              <div className={cx('text-filed')}>
                <p className={cx('text-title')}>
                  {t('round.broadcastingInfo.label')}
                </p>
              </div>
              <div className={cx('text-filed')}>
                <p className={cx('text-key')}>
                  {t('round.broadcastMethod.label')}
                </p>
                <p className={cx('text-contents')}>
                  {broadcasting?.broadcasting_method === 0
                    ? t('round.auto.label')
                    : t('round.manual.label')}
                </p>
              </div>
              <div className={cx('text-filed')}>
                <p className={cx('text-key')}>{t('round.completed.label')}</p>
                <p className={cx('text-contents')}>
                  {broadcasting?.completed_datetime || '-'}
                </p>
              </div>
            </>
          )}
        </div>
      </Slider>
    </>
  );
}

export default StageSpace;
