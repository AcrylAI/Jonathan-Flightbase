import { useState, useEffect, useRef } from 'react';
import { throttle } from 'lodash';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import DonutChart from '@src/components/uiContents/charts/DonutChart';
import ColumnChart from '@src/components/uiContents/charts/ColumnChart';
import StackedColumnChart from '@src/components/uiContents/charts/StackedColumnChart';
import TrainingResult from './TrainingResult';
import { Tooltip } from '@jonathan/ui-react';

// Icons
import NoPieChart from '@images/icon/ic-empty-piechart.svg';
import NoColumnChart from '@images/icon/ic-empty-columnchart.svg';
import InfoIcon from '@images/icon/ic-info-gray.svg';

// Utils
import { numberWithCommas } from '@src/utils/utils';

// Colors
import { colors } from '@src/utils/colors';

// CSS Module
import classNames from 'classnames/bind';
import style from './ClientTraining.module.scss';
const cx = classNames.bind(style);

function ClientTraining({ data }) {
  const { t } = useTranslation();
  const columnRef = useRef(null);
  const listRef = useRef(null);
  // Runtime Information
  const [runtimeInfo, setRuntimeInfo] = useState(null);
  // Trained Data by Client
  const [trainedDataByClient, setTrainedDataByClient] = useState(null);
  const [trainedDataByClientTotal, setTrainedDataByClientTotal] = useState(0);
  // Trained Data Count by Class
  const [trainedDataByLabel, setTrainedDataByLabel] = useState(null);
  const [trainedDataByLabelAverage, setTrainedDataByLabelAverage] = useState(0);
  const [trainedDataByLabelMin, setTrainedDataByLabelMin] = useState(0);
  const [trainedDataByLabelMax, setTrainedDataByLabelMax] = useState(0);
  const [trainedDataByLabelTotal, setTrainedDataByLabelTotal] = useState(0);
  const [trainedDataByLabelMinClasses, setTrainedDataByLabelMinClasses] =
    useState([]);
  const [trainedDataByLabelMaxClasses, setTrainedDataByLabelMaxClasses] =
    useState([]);
  const [trainedDataByLabelClassCount, setTrainedDataByLabelClassCount] =
    useState(0);
  // Client Ratio by Class
  const [clientDataByLabel, setClientDataByLabel] = useState(null);
  // Training Results
  const [trainingResults, setTriningResults] = useState([]);
  const [metricsKey, setMetricsKey] = useState([]);

  const columnSubjectScrollHandler = throttle((e) => {
    const list = listRef.current;
    if (list) {
      const scrollPos = e.target.scrollLeft;
      list.childNodes.forEach((node) => {
        const col = node.childNodes[5];
        if (col) {
          col.scrollTo({
            left: scrollPos,
          });
        }
      });
    }
  }, 7);

  const columnContentsScrollHandler = throttle((e) => {
    const column = columnRef.current;
    if (column) {
      const scrollPos = e.target.scrollLeft;
      column.scrollTo({
        left: scrollPos,
      });
    }
  }, 7);

  useEffect(() => {
    if (data) {
      const { runtime_information, chart_data, training_results } = data;
      setRuntimeInfo(runtime_information);
      setTrainedDataByClient(chart_data?.data_by_client.data);
      setTrainedDataByClientTotal(chart_data?.data_by_client.total);
      setTrainedDataByLabel(chart_data?.data_count.data);
      // setTrainedDataByLabelAverage(chart_data?.data_count.average);
      // setTrainedDataByLabelMin(chart_data?.data_count.min_count);
      // setTrainedDataByLabelMax(chart_data?.data_count.max_count);
      // setTrainedDataByLabelTotal(chart_data?.data_count.total_count);
      setClientDataByLabel(chart_data?.ratio_by_data.data);
      setTriningResults(training_results);
      if (training_results.length > 0) {
        setMetricsKey(Object.keys(training_results[0].metrics));
      }
    }
  }, [data]);

  /**
   * 클래스별 학습 데이터 수 차트에 들어갈 정보 가공
   */
  useEffect(() => {
    if (trainedDataByLabel) {
      let total = 0;
      const classCount = trainedDataByLabel.length;
      const countList = trainedDataByLabel.map(({ count }) => {
        total += count;
        return count;
      });
      const avg = (total / classCount).toFixed(2);
      const max = Math.max(...countList);
      const min = Math.min(...countList);
      const maxClasses = [];
      const minClasses = [];
      trainedDataByLabel.forEach(({ label, count }) => {
        if (count === max) {
          maxClasses.push(label);
        } else if (count === min) {
          minClasses.push(label);
        }
      });
      setTrainedDataByLabelTotal(total);
      setTrainedDataByLabelAverage(avg);
      setTrainedDataByLabelMax(max);
      setTrainedDataByLabelMin(min);
      setTrainedDataByLabelMaxClasses(maxClasses);
      setTrainedDataByLabelMinClasses(minClasses);
      setTrainedDataByLabelClassCount(classCount);
    }
  }, [trainedDataByLabel]);

  useEffect(() => {
    const column = columnRef.current;
    if (column) {
      column.addEventListener('scroll', columnSubjectScrollHandler);
    }

    return () => {
      if (column) {
        column.removeEventListener('scroll', columnSubjectScrollHandler);
      }
    };
  }, [columnSubjectScrollHandler]);

  useEffect(() => {
    const list = listRef.current;
    const column = columnRef.current;
    if (list && column) {
      list.childNodes.forEach((node, idx) => {
        if (idx !== 0 && node.childNodes[5]) {
          node.childNodes[5].addEventListener(
            'scroll',
            columnContentsScrollHandler,
          );
        }
      });
    }

    return () => {
      if (list && column) {
        list.childNodes.forEach((node, idx) => {
          if (idx !== 0 && node.childNodes[5]) {
            node.childNodes[5].removeEventListener(
              'scroll',
              columnContentsScrollHandler,
            );
          }
        });
      }
    };
  }, [columnContentsScrollHandler]);

  return (
    <div className={cx('client-training')}>
      <div className={cx('double-card')}>
        <div className={cx('runtime-info')}>
          <label className={cx('title')}>
            {t('roundDetail.runtimeinfo.label')}
          </label>
          <div className={cx('row')}>
            <label className={cx('text-key')}>
              {t('roundDetail.stageDuration.label')}
            </label>
            <span className={cx('text-contents')}>
              {runtimeInfo?.start_datetime || '0000-00-00 00:00:00'} -{' '}
              {runtimeInfo?.end_datetime || '0000-00-00 00:00:00'}
            </span>
          </div>
          <div className={cx('row')}>
            <label className={cx('text-key')}>
              {t('roundDetail.seedModel.label')}
            </label>
            <span className={cx('text-contents')}>
              {runtimeInfo?.seed_model_round_name
                ? t('round.version.label', {
                    version: runtimeInfo?.seed_model_round_name,
                  })
                : '-'}
            </span>
          </div>
          <div className={cx('row', 'hyper-parameters')}>
            <label className={cx('text-key')}>
              {t('roundDetail.hyperParam.label')}
            </label>
            <span className={cx('text-contents', 'parameters')}>
              {runtimeInfo &&
                Object.keys(runtimeInfo?.hyperparameter).map((entrie, idx) => {
                  return (
                    <span key={idx}>
                      {entrie}&nbsp;:&nbsp;&nbsp;
                      {runtimeInfo?.hyperparameter[entrie]}
                    </span>
                  );
                })}
            </span>
          </div>
          <div className={cx('row')}>
            <label className={cx('text-key')}>
              {t('roundDetail.localModelSelection.label')}
            </label>
            <span className={cx('text-contents')}>
              {runtimeInfo &&
                (runtimeInfo?.local_model_selection === 0 ? 'Latest' : 'Best')}
            </span>
          </div>
          <div className={cx('row')}>
            <label className={cx('text-key')}>
              {t('roundDetail.clientParicipation.label')}
            </label>
            <span className={cx('text-contents')}>
              {runtimeInfo &&
                t('outof.label', {
                  part: runtimeInfo?.number_of_joined_clients,
                  all: runtimeInfo?.total_number_of_clients,
                })}
            </span>
          </div>
        </div>
        <div className={cx('trained-data-chart')}>
          <label className={cx('title')}>
            {t('roundDetail.trainedDataByClient.label')}
          </label>
          {trainedDataByClient ? (
            <DonutChart
              tagId={'trainedDataByClient'}
              data={trainedDataByClient}
              total={trainedDataByClientTotal}
              customStyle={{
                width: '95%',
                height: '276px',
              }}
            />
          ) : (
            <div className={cx('no-data-box')}>
              <img src={NoPieChart} alt='no data' />
              <span>{t('roundDetail.noData.message')}</span>
            </div>
          )}
        </div>
      </div>
      <div className={cx('single-card')}>
        <div className={cx('trained-data-count')}>
          <div className={cx('title-area')}>
            <label className={cx('title')}>
              {t('roundDetail.trainedDataCountByClass.label')}
            </label>
            <div className={cx('class-count')}>
              {t('classCount.label')}: {trainedDataByLabelClassCount}
            </div>
          </div>
          <div className={cx('info-area')}>
            <div className={cx('info-item')}>
              <label className={cx('label')}>
                <span className={cx('marker', 'count')}></span>
                {t('dataCount.label')}
              </label>
              <div className={cx('value')}>
                {numberWithCommas(trainedDataByLabelTotal)}
              </div>
            </div>
            <div className={cx('info-item')}>
              <label className={cx('label')}>
                <span className={cx('marker', 'max')}></span>
                {t('maxValue.label')}
              </label>
              <div className={cx('value')}>
                {numberWithCommas(trainedDataByLabelMax)}
                <Tooltip
                  icon={InfoIcon}
                  contents={
                    <div>
                      <label
                        style={{
                          color: colors.DARK.MONO_201,
                          marginRight: '12px',
                        }}
                      >
                        {t('class.label')}
                      </label>
                      <span style={{ color: colors.DARK.MONO_200 }}>
                        {trainedDataByLabelMaxClasses.join(', ')}
                      </span>
                    </div>
                  }
                  iconCustomStyle={{
                    width: '16px',
                    marginLeft: '4px',
                    verticalAlign: 'text-top',
                  }}
                  contentsCustomStyle={{
                    backgroundColor: colors.DARK.MONO_205,
                  }}
                />
              </div>
            </div>
            <div className={cx('info-item')}>
              <label className={cx('label')}>
                <span className={cx('marker', 'avg')}></span>
                {t('avgValue.label')}
              </label>
              <div className={cx('value')}>
                {numberWithCommas(trainedDataByLabelAverage)}
              </div>
            </div>
            <div className={cx('info-item')}>
              <label className={cx('label')}>
                <span className={cx('marker', 'min')}></span>
                {t('minValue.label')}
              </label>
              <div className={cx('value')}>
                {numberWithCommas(trainedDataByLabelMin)}
                <Tooltip
                  icon={InfoIcon}
                  contents={
                    <div>
                      <label
                        style={{
                          color: colors.DARK.MONO_201,
                          marginRight: '12px',
                        }}
                      >
                        {t('class.label')}
                      </label>
                      <span style={{ color: colors.DARK.MONO_200 }}>
                        {trainedDataByLabelMinClasses.join(', ')}
                      </span>
                    </div>
                  }
                  iconCustomStyle={{
                    width: '16px',
                    marginLeft: '4px',
                    verticalAlign: 'text-top',
                  }}
                  contentsCustomStyle={{
                    backgroundColor: colors.DARK.MONO_205,
                  }}
                />
              </div>
            </div>
          </div>
          {trainedDataByLabel ? (
            <ColumnChart
              tagId={'trainedDataByLabel'}
              data={trainedDataByLabel}
              average={trainedDataByLabelAverage}
              min={trainedDataByLabelMin}
              max={trainedDataByLabelMax}
              customStyle={{
                width: '100%',
                height: '360px',
                backgroundColor: 'transparent',
                padding: '5px',
              }}
            />
          ) : (
            <div className={cx('no-data-box')}>
              <img src={NoColumnChart} alt='no data' />
              <span>{t('roundDetail.noData.message')}</span>
            </div>
          )}
        </div>
        <div className={cx('clients-ratio-data')}>
          <div className={cx('title-area')}>
            <label className={cx('title')}>
              {t('roundDetail.clientRatioByClass.label')}
            </label>
          </div>
          {clientDataByLabel ? (
            <StackedColumnChart
              tagId={'clientDataByLabel'}
              data={clientDataByLabel}
              customStyle={{
                width: '100%',
                height: '360px',
                backgroundColor: 'transparent',
              }}
            />
          ) : (
            <div className={cx('no-data-box')}>
              <img src={NoColumnChart} alt='no data' />
              <span>{t('roundDetail.noData.message')}</span>
            </div>
          )}
        </div>
      </div>
      <div className={cx('training-results')}>
        <label className={cx('title')}>
          {t('roundDetail.trainingResults.label')}
        </label>
        {/* 학습 결과 리스트 */}
        <ul className={cx('result-list')} ref={listRef}>
          <li className={cx('columns', `metric-size-${metricsKey.length}`)}>
            <label>{t('client.label')}</label>
            <label>{t('roundDetail.trainingDuration.label')}</label>
            <div className={cx('metric-column')} ref={columnRef}>
              {metricsKey &&
                metricsKey.map((key, idx) => <label key={idx}>{key}</label>)}
            </div>
            <label></label>
          </li>
          {trainingResults.map(
            (
              {
                client_name,
                start_datetime,
                end_datetime,
                metrics,
                data_count,
                training_log,
              },
              idx,
            ) => (
              <TrainingResult
                key={idx}
                idx={idx}
                clientName={client_name}
                startDatetime={start_datetime}
                endDatetime={end_datetime}
                metricsKey={metricsKey}
                metrics={metrics}
                dataCount={data_count}
                trainingLog={training_log}
              />
            ),
          )}
        </ul>
      </div>
    </div>
  );
}

export default ClientTraining;
