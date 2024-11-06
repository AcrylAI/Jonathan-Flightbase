import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

// Components
import { Button, Selectbox } from '@jonathan/ui-react';
import ModelMetric from './ModelMetric';
// import ProjectNetwork from './ProjectNetwork';
import NewProjectNetwork from './NewProjectNetwork';
import ClientStatus from './ClientStatus';
import RoundsList from './RoundsList';

// i18n
import { useTranslation } from 'react-i18next';

// Icons
import IconImageArrow from '@images/icon/ic-arrow-right-blue.svg.svg';

// Types
import { API_DASHBOARD } from '@src/utils/types';

// CSS module
import style from './DashboardContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function DashboardContent({
  data,
  metricData,
  networkData,
  clientsData,
  roundsData,
  modelInfoData,
  searchOptions,
  selectedItem,
  selectInputHandler,
}) {
  const { t } = useTranslation();

  const history = useHistory();
  const [{ theme }] = useSelector(({ theme, httpRequest }) => [
    theme,
    httpRequest[API_DASHBOARD] ? httpRequest[API_DASHBOARD].loading : false,
  ]);

  // State

  const clientsDataList = [
    { status: 'connected', number: 0, color: '#ffffff' },
    { status: 'disconnected', number: 0, color: '#ffbc3b' },
    { status: 'error', number: 0, color: '#de4747' },
  ];

  const roundsClickHandler = (roundNumber, status, roundName) => {
    if (status !== 'complete') {
      history.push('/rounds');
    } else {
      history.push({
        pathname: `/rounds/${roundNumber}/rounds`,
        state: { groupId: roundName },
      });
    }
  };

  const textLengthHandler = (name, text = '') => {
    switch (name) {
      case 'modelName':
        if (text.length > 20) {
          return text.slice(0, 20) + '...';
        } else if (text === '') {
          return 'Model Title';
        }
        return text;

      case 'desc':
        if (text.length > 130) {
          return text.slice(0, 127) + '...';
        } else if (text === '') {
          return 'Model description';
        }
        return text;

      default:
        break;
    }
  };

  return (
    <div className={cx('dashboard')}>
      <h1 className={cx('page-title')}>{t('dashboard.label')}</h1>
      <div className={cx('row-container')}>
        <div className={cx('first-row')}>
          <div className={cx('content-graph')}>
            <div className={cx('content-top')}>
              <div className={cx('title')}>
                {t('dashboard.globalModelMetric.title.label')}
              </div>
            </div>
            <div className={cx('content-mid')}>
              <div className={cx('mid-number')}>
                {metricData?.latest_metric}
              </div>
              <div className={cx('mid-selectbox')}>
                <Selectbox
                  theme={theme}
                  selectedItem={selectedItem}
                  list={searchOptions}
                  onChange={selectInputHandler}
                  placeholder={!metricData ? '' : 'dashboard.noMetricFound'}
                  isDisable={metricData?.round_data?.length < 1}
                  t={t}
                />
              </div>
            </div>
            <div className={cx('content-metric')}>
              <ModelMetric metricData={metricData} />
            </div>
          </div>

          <div className={cx('first-row-bottom')}>
            <div className={cx('content-network')}>
              <div className={cx('title')}>
                {t('dashboard.projectNetwork.title.label')}
              </div>
              {/* <ProjectNetwork orgChart={orgChart} /> */}
              <NewProjectNetwork networkData={networkData} />
            </div>
            <div className={cx('content-clients')}>
              <div className={cx('title-wrap')}>
                <div className={cx('title')}>{t('clients.label')}</div>
                <div className={cx('clients-btn')}>
                  <Button
                    type='text-underline'
                    size='medium'
                    iconAlign='right'
                    icon={IconImageArrow}
                    onClick={() => {
                      history.push('/clients');
                    }}
                  >
                    {t('dashboard.clients.goToClients.label')}
                  </Button>
                </div>
              </div>
              <div className={cx('clients')}>
                <span className={cx('clients-head')}>
                  {t('dashboard.clients.totalJoined.label')}
                </span>
                <span className={cx('clients-subhead')}>
                  {clientsData?.total_joined || 0} {t('clients.label')}
                </span>
              </div>
              <div className={cx('status')}>
                {clientsData &&
                  clientsDataList.map((clientStatus, idx) => {
                    return (
                      <ClientStatus
                        key={idx}
                        clientStatus={clientStatus}
                        clientsData={clientsData}
                      />
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
        <div className={cx('second-row')}>
          <div className={cx('content-model')}>
            <div className={cx('title')}>
              {t('dashboard.projectModel.title.label')}
            </div>
            <div
              className={cx(
                'name',
                (modelInfoData?.title === '' || !modelInfoData?.title) &&
                  'empty-model',
              )}
            >
              {textLengthHandler('modelName', modelInfoData?.title)}
              {modelInfoData?.title?.length > 20 && (
                <div className={cx('name-drop')}>{modelInfoData?.title}</div>
              )}
            </div>
            {/* <div className={cx('desc-title')}>
              {t('dashboard.projectModel.description.label')}
            </div> */}
            <div
              className={cx(
                'desc',
                (modelInfoData?.desc === '' || !modelInfoData?.desc) &&
                  'empty-model',
              )}
            >
              {textLengthHandler('desc', modelInfoData?.desc)}
              {modelInfoData?.desc?.length > 130 && (
                <div className={cx('desc-drop')}>{modelInfoData?.desc}</div>
              )}
            </div>
          </div>
          <div className={cx('content-rounds')}>
            <div className={cx('title-wrap')}>
              <div className={cx('title')}>
                {t('dashboard.latestRounds.title.label')}
              </div>
              <div className={cx('clients-btn')}>
                <Button
                  type='text-underline'
                  size='medium'
                  iconAlign='right'
                  icon={IconImageArrow}
                  onClick={() => {
                    history.push('/rounds');
                  }}
                >
                  {t('dashboard.latestRounds.goToRounds.label')}
                </Button>
              </div>
            </div>
            <div
              className={cx(
                'rounds-list',
                roundsData?.length < 1 && 'empty-rounds',
              )}
            >
              {roundsData?.length < 1 ? (
                <>
                  <span className={cx('empty-rounds-text')}>
                    {t('dashboard.latestRounds.empty.message')}
                  </span>
                  <Button
                    type='primary'
                    theme={theme}
                    customStyle={{ marginTop: '26px' }}
                    onClick={() => {
                      history.push({
                        pathname: '/rounds',
                        state: {
                          dashboard: true,
                        },
                      });
                    }}
                  >
                    {t('dashboard.latestRounds.newRound.label')}
                  </Button>
                </>
              ) : (
                roundsData?.slice(0, 6).map(
                  (
                    {
                      round_name: number, // 라운드 번호
                      client_count: client, // 클라이언트 숫자
                      round_result: metrics,
                      round_stage: stage, // status card 내용
                      round_status: status,
                      round_group_name: name,
                    },
                    idx,
                  ) => {
                    let statusText = '';
                    let newStatus = null;
                    let progressStage = {};
                    if (status === 'complete' && metrics?.metrics) {
                      let dir;
                      if (metrics?.change_direction) {
                        dir = metrics.change_direction;
                      }
                      const [acc] = Object.values(metrics.metrics);
                      progressStage = { dir, acc };
                    } else if (status === 'stop') {
                      statusText = t('round.stop.label');
                    } else if (status === 'fail') {
                      statusText = t('round.error.label');
                      newStatus = 'failed';
                    } else {
                      // * active일때
                      switch (stage) {
                        case 3:
                          statusText = t('round.broadcastingStage.label');
                          break;
                        case 2:
                          statusText = t('round.aggregationStage.label');
                          break;
                        case 1:
                          statusText = t('round.clientTrainingStage.label');
                          break;
                        case 0:
                          statusText = t('round.idleStage.label');
                          break;
                        default:
                          break;
                      }
                    }

                    return (
                      <RoundsList
                        key={idx}
                        number={number} // str. 라운드 넘버
                        progressStage={progressStage} // obj. 진행 숫자와 svg 방향
                        stage={statusText} // str. status card 내용.
                        status={newStatus ? newStatus : status} // str. complete | fail | stop | active
                        metrics={metrics} // obj.
                        client={client} // 클라이언트 숫자
                        name={name}
                        roundsClickHandler={roundsClickHandler}
                      />
                    );
                  },
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;
