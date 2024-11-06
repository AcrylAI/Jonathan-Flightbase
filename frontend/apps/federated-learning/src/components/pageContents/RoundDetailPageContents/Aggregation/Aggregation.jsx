import { useState, useEffect, useRef } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Switch, Selectbox } from '@jonathan/ui-react';
import PieChart from '@src/components/uiContents/charts/PieChart';
import StackedColumnLineChart from '@src/components/uiContents/charts/StackedColumnLineChart';
import ParallelFlowChart from '@src/components/uiContents/charts/ParallelFlowChart';

import { Button, StatusCard } from '@jonathan/ui-react';

// Icons
import IconImageArrow from '@images/icon/ic-arrow-right-blue.svg.svg';
import NoPieChart from '@images/icon/ic-empty-piechart.svg';
import NoColumnChart from '@images/icon/ic-empty-columnchart.svg';
import LineRatioView from '@images/icon/ic-linechart-gray.svg';
import ParallelPlotView from '@images/icon/ic-parallelplot-gray.svg';
import LineRatioViewActive from '@images/icon/ic-linechart-blue.svg';
import ParallelPlotViewActive from '@images/icon/ic-parallelplot-blue.svg';
import AscSort from '@images/icon/ic-asc.svg';
import DescSort from '@images/icon/ic-desc.svg';
import { toast } from '@src/components/uiContents/Toast';

// utils
import { colors } from '@src/utils/colors';

// CSS Module
import classNames from 'classnames/bind';
import style from './Aggregation.module.scss';
const cx = classNames.bind(style);

function Aggregation({
  data,
  theme,
  roundInfo,
  getChartData,
  hpsChartData,
  getHpsLogData,
}) {
  const scrollRef = useRef();

  const { t } = useTranslation();
  const [runtimeInfo, setRuntimeInfo] = useState(null);
  const [aggregationDataByClient, setAggregationDataByClient] = useState(null);
  const [aggregationLog, setAggregationLog] = useState(null);
  const [hpsDataByRound, setHpsDataByRound] = useState(null);
  const [parallelChartData, setParallelChartData] = useState({});
  const [showTarget, setShowTarget] = useState(true);
  const [orderOptions, setOrderOptions] = useState([]);
  const [hpsList, setHpsList] = useState([]);
  const [logOpen, setLogOpen] = useState([]);
  const [columnsName, setColumnsName] = useState([]);
  const [hpsChartView, setHpsChartView] = useState(0); // 0: Line&Ratio, 1: Parallel Plot
  const [sortKey, setSortKey] = useState('id');
  const [sortOrder, setSortOrder] = useState({
    label: 'Ascending',
    value: 'asc',
    icon: AscSort,
    iconAlign: 'left',
  });

  /**
   * log 데이터 get
   * @param {String} id
   * @param {String} groupId
   * @param {String} hpsId
   * @param {String} idx // 몇번째 idx
   */
  const getHPSLog = async ({ id, groupId, hpsId, idx }) => {
    const response = await getHpsLogData(groupId, id, hpsId);
    const { result, status, message } = response;
    if (status === 1) {
      let prevHpsList = logOpen.slice(0, idx);
      const currHpsList = logOpen.slice(idx + 1, logOpen?.length);

      const newLogOpenList = [
        ...prevHpsList,
        { [idx]: !logOpen[idx][idx], log: result.join('') },
        ...currHpsList,
      ];

      setLogOpen(newLogOpenList);
      scrollHandler(idx);
    } else {
      toast.error(message);
    }
  };

  const scrollHandler = (idx) => {
    scrollRef.current[idx]?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (data) {
      const {
        runtime_information,
        aggregation_ratio,
        aggregation_log,
        hyperparameter_search_chart_data,
        hyperparameter_search_item_list,
      } = data;
      setRuntimeInfo(runtime_information);
      setAggregationDataByClient(aggregation_ratio?.data);
      if (runtime_information?.aggregation_method === 0) {
        const newHpsData = [];
        hyperparameter_search_chart_data?.client_ratio_by_round?.forEach(
          (data, idx) => newHpsData.push({ ...data, idx }),
        );
        setHpsDataByRound(newHpsData);
        setHpsList(hyperparameter_search_item_list);
        if (
          hyperparameter_search_chart_data?.parallel_chart_data?.data &&
          hyperparameter_search_chart_data?.parallel_chart_data?.clients
        ) {
          const { data: parallelChartData } =
            hyperparameter_search_chart_data.parallel_chart_data;
          const { clients: parallelClientsData } =
            hyperparameter_search_chart_data.parallel_chart_data;

          let min = Infinity;
          let max = -Infinity;
          parallelChartData.forEach((data) => {
            max = Math.max(max, data[data.length - 1]);
            min = Math.min(min, data[data.length - 1]);
          });

          const parallelData = {
            parallelAxis: parallelClientsData.map((client, idx) => {
              return {
                dim: idx,
                name: client,
                min: 0,
                max: 100,
                axisLine: {
                  lineStyle: {
                    color: '#D2D2D2',
                    width: 1,
                  },
                },
                areaSelectStyle: {
                  width: 7,
                  opacity: 1,
                  color: colors.DARK.MONO_203,
                  borderWidth: 1,
                  borderColor: colors.DARK.MONO_201,
                },
                axisPointer: {
                  type: 'line',
                },
                splitNumber: 1,
                minorTick: {
                  show: true,
                },
              };
            }),
            backgroundColor: colors.DARK.MONO_206,
            tooltip: {
              padding: 10,
              backgroundColor: '#222',
              borderColor: '#777',
              borderWidth: 1,
            },
            visualMap: {
              show: false,
              min: 0,
              max: 100,
              dimension: 2,
              inRange: {
                color: ['#00FFF0', '#3AFF00', '#3C53FF'],
                colorAlpha: [1, 2],
              },
            },
            parallel: {
              left: '5%',
              parallelAxisDefault: {
                type: 'value',
                nameLocation: 'end',
                nameGap: 20,
                nameTextStyle: {
                  color: '#fff',
                  fontSize: 12,
                },
                axisLine: {
                  lineStyle: {
                    color: '#aaa',
                  },
                },
                axisTick: {
                  lineStyle: {
                    color: '#777',
                  },
                },
                splitLine: {
                  show: false,
                },
                axisLabel: {
                  color: '#fff',
                },
              },
            },
            series: [
              {
                type: 'parallel',
                lineStyle: {
                  width: 1,
                  opacity: 0.5,
                },
                // smooth: true,
                data: parallelChartData,
              },
            ],
          };
          parallelData.parallelAxis.push({
            dim: parallelData.parallelAxis.length,
            name: 'target',
            nameTextStyle: {
              fontSize: 14,
            },
            min,
            max,
            axisLine: {
              lineStyle: {
                color: '#fff',
                width: 2,
              },
            },
            areaSelectStyle: {
              width: 7,
              opacity: 1,
              color: colors.DARK.MONO_203,
              borderWidth: 1,
              borderColor: colors.DARK.MONO_201,
            },
            axisPointer: {
              type: 'line',
            },
            splitNumber: 1,
            minorTick: {
              show: true,
            },
          });
          setParallelChartData(parallelData);
        }
      } else {
        setAggregationLog(aggregation_log);
      }
    }
  }, [data]);

  useEffect(() => {
    const columnsName = [];
    if (hpsList && hpsList.length > 0) {
      columnsName.push(...Object.keys(hpsList[0]?.params_ratio));
      const logOpenInitial = [];
      hpsList.forEach((hpsItem, idx) =>
        logOpenInitial.push({ [idx]: false, log: null }),
      );
      setLogOpen(logOpenInitial);
    }
    setColumnsName(columnsName);
  }, [hpsList]);

  useEffect(() => {
    if (hpsDataByRound && hpsDataByRound.length > 0) {
      const keys = Object.keys(hpsDataByRound[0]);
      const options = [];
      keys.forEach((v) => {
        if (v === 'id') {
          options.push({
            label: t('roundDetail.hpsNumber.label'),
            value: 'id',
          });
        } else if (v === 'target') {
          options.push({ label: 'Target', value: 'target' });
        } else if (v !== 'idx') {
          options.push({
            label: v,
            value: v,
          });
        }
      });
      setOrderOptions(options);
    }
  }, [hpsDataByRound, t]);

  return (
    <div className={cx('aggregation')}>
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
              {t('roundDetail.method.label')}
            </label>
            <span className={cx('text-contents')}>
              {runtimeInfo?.aggregation_method === 0
                ? 'Hyper Parameter Search'
                : 'Custom Parameters'}
            </span>
          </div>
          {runtimeInfo?.aggregation_method === 0 ? (
            <>
              <div className={cx('row')}>
                <label className={cx('text-key')}>
                  {t('round.hpsMethod.label')}
                </label>
                <span className={cx('text-contents')}>
                  {runtimeInfo?.hyperparameter_search?.info?.method === 0
                    ? 'Bayesian'
                    : 'Random'}
                </span>
              </div>
              <div className={cx('row')}>
                <label className={cx('text-key')}>HPS {t('count.label')}</label>
                <span className={cx('text-contents')}>
                  {runtimeInfo?.hyperparameter_search?.info?.count}
                </span>
              </div>
            </>
          ) : (
            <div className={cx('row')}>
              <label className={cx('text-key')}>
                {t('roundDetail.parameters.label')}
              </label>
              <span className={cx('text-contents', 'parameters')}>
                {runtimeInfo?.custom?.aggregation_custom_parameter
                  ? Object.keys(
                      runtimeInfo.custom.aggregation_custom_parameter,
                    ).map((entrie, idx) => {
                      return (
                        <span key={idx}>
                          {entrie}&nbsp;:&nbsp;&nbsp;
                          {
                            runtimeInfo.custom.aggregation_custom_parameter[
                              entrie
                            ]
                          }
                        </span>
                      );
                    })
                  : '-'}
              </span>
            </div>
          )}
        </div>
        <div className={cx('model-ratio-by-client')}>
          <label className={cx('title', 'chart-title')}>
            {t('roundDetail.globalModalAggRatio.label')}
          </label>
          {aggregationDataByClient && aggregationDataByClient.length > 0 ? (
            <PieChart
              tagId={'aggregationDataByClient'}
              data={aggregationDataByClient}
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
      {runtimeInfo?.aggregation_method === 0 ? (
        <div className={cx('hps-chart')}>
          <div className={cx('title-box')}>
            <label className={cx('title')}>
              {t('roundDetail.HPSChart.label')}
            </label>
            <div className={cx('tab-area')}>
              <div
                className={cx('chart-view-tab', hpsChartView === 0 && 'active')}
                onClick={() => setHpsChartView(0)}
              >
                <img
                  src={hpsChartView === 0 ? LineRatioViewActive : LineRatioView}
                  alt='line&amp;Ratio Chart'
                />
                <label>{t('roundDetail.lineRatioView.label')}</label>
              </div>
              <div
                className={cx('chart-view-tab', hpsChartView === 1 && 'active')}
                onClick={() => setHpsChartView(1)}
              >
                <img
                  src={
                    hpsChartView === 1
                      ? ParallelPlotViewActive
                      : ParallelPlotView
                  }
                  alt='Parallel Plot Chart'
                />
                <label>{t('roundDetail.parallelPlotView.label')}</label>
              </div>
            </div>
          </div>
          {hpsDataByRound && hpsDataByRound.length > 0 ? (
            <>
              {hpsChartView === 0 ? (
                <div className={cx('chart-area', 'column-chart')}>
                  <div className={cx('control-area')}>
                    <div className={cx('switch-box')}>
                      <label>{t('roundDetail.showTarget.label')}</label>
                      <Switch
                        size='medium'
                        checked={showTarget}
                        labelAlign='left'
                        onChange={() => setShowTarget(!showTarget)}
                      />
                    </div>
                    <div className={cx('sort-box')}>
                      <label>{t('roundDetail.sortBy.label')}</label>
                      <Selectbox
                        theme={theme}
                        list={orderOptions}
                        onChange={({ value }) => {
                          setSortKey(value);
                          getChartData({
                            id: roundInfo?.id,
                            groupId: roundInfo?.groupId,
                            sortKey: value,
                            sortOrder: sortOrder.value,
                          });
                        }}
                        selectedItem={{ label: 'HPS Number', value: 'id' }}
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
                      <Selectbox
                        theme={theme}
                        list={[
                          {
                            label: t('roundDetail.ascending.label'),
                            value: 'asc',
                            icon: AscSort,
                            iconAlign: 'left',
                          },
                          {
                            label: t('roundDetail.descending.label'),
                            value: 'desc',
                            icon: DescSort,
                            iconAlign: 'left',
                          },
                        ]}
                        onChange={(value) => {
                          setSortOrder(value);
                          getChartData({
                            id: roundInfo?.id,
                            groupId: roundInfo?.groupId,
                            sortKey,
                            sortOrder: value?.value,
                          });
                        }}
                        selectedItem={sortOrder}
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
                    </div>
                  </div>
                  <StackedColumnLineChart
                    tagId={'hpsDataByRound'}
                    data={hpsChartData ? hpsChartData : hpsDataByRound}
                    customStyle={{
                      width: '100%',
                      height: '356px',
                      backgroundColor: 'transparent',
                    }}
                    labelRotation={0}
                    showLineChart={showTarget}
                  />
                </div>
              ) : (
                <div className={cx('chart-area')}>
                  <ParallelFlowChart parallelAxis={parallelChartData} />
                </div>
              )}
            </>
          ) : (
            <div className={cx('no-data-box')}>
              <img src={NoColumnChart} alt='no data' />
              <span>{t('roundDetail.noData.message')}</span>
            </div>
          )}
          <div className={cx('hps-created')}>
            <span className={cx('title')}>
              {t('roundDetail.HPSCreated.label')}
            </span>
            <div className={cx('table-area')}>
              <div className={cx('table-box')}>
                <div className={cx('table-title-wrap')}>
                  <div className={cx('table-column', 'table-count')}>
                    {t('count.label')}
                  </div>
                  <div className={cx('table-column', 'table-accuracy')}>
                    {t('accuracy.label')}
                  </div>
                  {columnsName?.length > 0 &&
                    columnsName.map((columns, idx) => {
                      return (
                        <div
                          key={idx}
                          className={cx('table-column', 'table-variable')}
                        >
                          {columns}
                        </div>
                      );
                    })}
                  <div className={cx('table-column', 'table-seelog')}></div>
                </div>
              </div>
              {hpsList?.length > 0 ? (
                hpsList.map((hpsItem, idx) => {
                  const ratioItem = Object.values(hpsItem?.params_ratio);
                  return (
                    <div
                      key={idx}
                      className={cx('table-value-box')}
                      ref={scrollRef}
                    >
                      <div className={cx('table-row-box')}>
                        <div
                          key={hpsItem?.id}
                          className={cx('table-value-wrap')}
                        >
                          <div
                            className={cx('table-value', 'table-count')}
                            ref={(el) => {
                              scrollRef.current &&
                                (scrollRef.current[idx] = el);
                            }}
                          >
                            {`(${hpsItem?.id}/${hpsItem?.hps_total_count})`}
                            {hpsItem?.best && (
                              <StatusCard
                                status={'running'}
                                text={'Best'}
                                size='small'
                                theme={theme}
                                customStyle={{ marginLeft: '13px' }}
                              />
                            )}
                          </div>
                          <div className={cx('table-value', 'table-accuracy')}>
                            {Math.round(
                              (hpsItem?.target + Number.EPSILON) * 100,
                            ) / 100}
                          </div>
                          {ratioItem?.length > 0 &&
                            ratioItem.map((ratioValue, idx) => {
                              return (
                                <div
                                  key={idx}
                                  className={cx(
                                    'table-value',
                                    'table-variable',
                                  )}
                                >
                                  {Math.round(
                                    (ratioValue + Number.EPSILON) * 100,
                                  ) / 100}
                                </div>
                              );
                            })}

                          <div className={cx('table-value', 'table-seelog')}>
                            {logOpen.length > 0 && (
                              <Button
                                type='text-underline'
                                theme={theme}
                                customStyle={{
                                  lineHeight: '72px',
                                }}
                                icon={IconImageArrow}
                                iconAlign='right'
                                iconStyle={{
                                  transform: logOpen[idx][idx]
                                    ? 'rotate(270deg) translateY(-2px)'
                                    : 'rotate(90deg) translateY(2px)',
                                }}
                                onClick={() => {
                                  getHPSLog({
                                    id: roundInfo?.id,
                                    groupId: roundInfo?.groupId,
                                    hpsId: hpsItem?.id,
                                    idx,
                                  });
                                }}
                              >
                                {t('seeLog.label')}
                              </Button>
                            )}
                          </div>
                        </div>
                        {logOpen[idx]?.log && logOpen[idx][idx] && (
                          <div className={cx('table-log-wrap')}>
                            {logOpen[idx]?.log}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={cx('no-data-box')}>
                  <span>{t('roundDetail.noData.message')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={cx('custom-log')}>
          <div className={cx('title')}>
            {t('roundDetail.aggregationLog.label')}
          </div>
          <div className={cx('log-area')}>
            {aggregationLog ? (
              aggregationLog.map((t, idx) => <span key={idx}>{t}</span>)
            ) : (
              <div className={cx('no-data-box')}>
                {t('roundDetail.noData.message')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Aggregation;
