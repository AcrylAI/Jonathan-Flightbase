import { useState } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Checkbox } from '@jonathan/ui-react';
import ArrowButton from '@src/components/atoms/button/ArrowButton';
import Status from '@src/components/atoms/Status';

// Utils
import { convertLocalTime, calcDuration } from '@src/datetimeUtils';

// CSS module
import style from './HpsListContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const HpsListContent = ({
  hpsName,
  data,
  onViewLog,
  onSelect,
  checked,
  onStopHps,
}) => {
  const { t } = useTranslation();
  const isAccel = data.options.gpu_acceleration === 1;
  const isUM = data.options.um === 1;
  const isRDMA = data.options.rdma === 1;

  const { search_parameter: searchParam } = data;
  const searchParamKeys = searchParam ? Object.keys(searchParam) : [];

  const { score_parameter: scoreParam } = data;
  const scoreParamKeys = scoreParam ? Object.keys(scoreParam) : [];

  const [isExpand, setExpand] = useState(false);

  const showHideHandler = () => {
    setExpand(!isExpand);
  };
  return (
    <div className={cx('group-contents', checked && 'selected')}>
      <div className={cx('list-item')}>
        <div className={cx('left-column')}>
          <div className={cx('checkbox')}>
            <Checkbox
              value={data.id}
              name={hpsName}
              checked={checked}
              onChange={() => onSelect(data.id)}
            />
          </div>
          <div className={cx('status')}>
            <Status status={data.status.status} title={data.status.reason} />
          </div>
          {data.status.status === 'running' ? (
            <img
              className={cx('hps-stop-btn')}
              src='/images/icon/00-ic-basic-stop-o.svg'
              alt='stop'
              onClick={() => {
                if (data.status.status === 'running') onStopHps();
              }}
            />
          ) : (
            <img
              className={cx('hps-stop-btn', 'disabled')}
              src='/images/icon/00-ic-basic-stop-o.svg'
              alt='stop'
            />
          )}
          <div className={cx('hps-info')}>
            <div className={cx('hps-index')}>
              HPS <span>{data.index + 1}</span>
            </div>
            <div>
              <div className={cx('gpu-count')}>
                <label className={cx('label')}>{t('gpuUsed.label')}</label>
                <span className={cx('value')}>{data.gpu_count || '-'}</span>
              </div>
              <div className={cx('features')}>
                {isAccel && <span className={cx('features-tag')}>ACCEL</span>}
                {isUM && <span className={cx('features-tag')}>UM</span>}
                {isRDMA && <span className={cx('features-tag')}>RDMA</span>}
              </div>
            </div>
          </div>
          <div className={cx('hps-result-box')}>
            <div className={cx('hps-result')}>
              <div className={cx('method')}>
                <label className={cx('label')}>{t('hpsMethod.label')}</label>
                <span className={cx('value')}>{data.method || '-'}</span>
              </div>
              <div className={cx('parameters')}>
                <label className={cx('label')}>{t('searchRange.label')}</label>
                <div className={cx('range-box')}>
                  {searchParamKeys.length > 0
                    ? searchParamKeys.map((key) => (
                        <div key={key} className={cx('range-param')}>
                          <label className={cx('value', 'param')} title={key}>
                            {key}
                          </label>
                          <span
                            className={cx('value', 'param')}
                            title={searchParam[key].replace(',', ', ')}
                          >
                            {searchParam[key].replace(',', ', ') || '-'}
                          </span>
                        </div>
                      ))
                    : '-'}
                </div>
              </div>
              <div className={cx('score')}>
                <label className={cx('label')}>{t('score.label')}</label>
                <div className={cx('score-box')}>
                  <span
                    className={cx('value', 'score-value')}
                    title={data.score}
                  >
                    {data.score === null ? '-' : data.score}
                  </span>
                  <div className={cx('score-param-list')}>
                    <span className={cx('score-param-left')}>[</span>
                    {scoreParamKeys.length > 0
                      ? scoreParamKeys.map((key) => (
                          <div key={key} className={cx('score-param')}>
                            <label className={cx('value', 'param')} title={key}>
                              {key}
                            </label>
                            <span
                              className={cx('value', 'param')}
                              title={scoreParam[key]}
                            >
                              {scoreParam[key] === null
                                ? '-'
                                : scoreParam[key].toFixed(4)}
                            </span>
                          </div>
                        ))
                      : '-'}
                    <span className={cx('score-param-right')}>]</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={cx('more-btn-box')}>
              <ArrowButton
                isUp={!isExpand}
                color='blue'
                onClick={showHideHandler}
              >
                <span>{t('more.label')}</span>
              </ArrowButton>
            </div>
            {isExpand && (
              <div className={cx('hps-result-more')}>
                <div className={cx('search-count')}>
                  <label className={cx('label')}>{t('count.label')}</label>
                  <span className={cx('value')}>
                    {data.search_count || '-'}
                  </span>
                </div>
                {data.method === 'Bayesian Probability' && (
                  <div className={cx('init-points')}>
                    <label className={cx('label')}>
                      {t('initPoints.label')}
                    </label>
                    <span className={cx('value')}>
                      {data.init_points || '-'}
                    </span>
                  </div>
                )}
                {data.method === 'Uniform Grid' && (
                  <div className={cx('interval')}>
                    <label className={cx('label')}>{t('interval.label')}</label>
                    <span className={cx('value')}>{data.interval || '-'}</span>
                  </div>
                )}
                <div className={cx('save-file')}>
                  <label className={cx('label')}>
                    {t('saveFileName.label')}
                  </label>
                  <span className={cx('value')}>{data.save_file || '-'}</span>
                </div>
                <div className={cx('load-file')}>
                  <label className={cx('label')}>
                    {t('loadFileName.label')}
                  </label>
                  <span className={cx('value')}>{data.load_file || '-'}</span>
                </div>
                <div className={cx('gpu-instance')}>
                  <label className={cx('label')}>
                    GPU {t('instance.label')}
                  </label>
                  <span className={cx('value', 'pre')}>
                    {data.configurations
                      ? data.configurations.split(',').join('\n')
                      : '-'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={cx('right-column')}>
          <div className={cx('datetime')}>
            <span>
              {data.start_datetime
                ? `${convertLocalTime(data.start_datetime)} ~ `
                : '-'}
            </span>
            <span>
              {data.end_datetime && convertLocalTime(data.end_datetime)}
            </span>
          </div>
          <div className={cx('duration')}>
            <span>
              {data.start_datetime && data.end_datetime
                ? calcDuration(data.start_datetime, data.end_datetime)
                : '-'}
            </span>
          </div>
          <div className={cx('log')} name={t('viewResult.label')}>
            <img
              src='/images/icon/ic-log.svg'
              alt='view_log'
              className={cx(
                'log-btn',
                !(data.status.status !== 'pending' && data.log_file) &&
                  'disabled',
              )}
              onClick={() => {
                if (data.status.status !== 'pending' && data.log_file)
                  onViewLog(data, hpsName);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HpsListContent;
