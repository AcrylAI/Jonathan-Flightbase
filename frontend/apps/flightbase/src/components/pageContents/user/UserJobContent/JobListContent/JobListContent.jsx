// i18n
import { useTranslation } from 'react-i18next';

// Components
import Status from '@src/components/atoms/Status';
import { Checkbox } from '@jonathan/ui-react';

// Utils
import { convertLocalTime, calcDuration } from '@src/datetimeUtils';

// CSS module
import style from './JobListContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const JobListContent = ({
  trainingType,
  jobName,
  data,
  onViewLog,
  onSelect,
  checked,
  onStopJob,
  checkpointIsOpen,
  onCreateDeployment,
  jobIdx,
}) => {
  const { t } = useTranslation();
  const { hyper_parameter: hyperParam, dataset_parameter: datasetParam } = data;

  return (
    <div className={cx('group-contents', checked && 'selected')}>
      <div className={cx('list-item')}>
        <div className={cx('left-column')}>
          <div className={cx('checkbox')}>
            <Checkbox
              value={data.id}
              name={jobName}
              checked={checked}
              onChange={() => onSelect(data.id)}
            />
          </div>
          <div className={cx('status')}>
            <Status status={data.status.status} title={data.status.reason} />
          </div>
          {data.status.status === 'running' ? (
            <img
              className={cx('job-stop-btn')}
              src='/images/icon/00-ic-basic-stop-o.svg'
              alt='stop'
              onClick={() => {
                if (data.status.status === 'running') onStopJob();
              }}
            />
          ) : (
            <img
              className={cx('job-stop-btn', 'disabled')}
              src='/images/icon/00-ic-basic-stop-o.svg'
              alt='stop'
            />
          )}
          <div className={cx('job-index')}>
            {t('job.label')} <span>{data.index + 1}</span>
          </div>
          <div className={cx('parameters')}>
            <div className={cx('hyper-param')}>
              <label className={cx('param-label')}>
                {t('hpsParameters.label')}
              </label>
              <div className={cx('params')}>
                {hyperParam.length > 0
                  ? hyperParam.map(({ key, value }, idx) => {
                      return (
                        <div key={idx} className={cx('item')}>
                          <label className={cx('param')}>{key}</label>
                          <span className={cx('value')}>{value}</span>
                        </div>
                      );
                    })
                  : '-'}
              </div>
            </div>
            {datasetParam.length > 0 && (
              <div className={cx('dataset-param')}>
                <label className={cx('param-label')}>
                  {t('datasetParameters.label')}
                </label>
                <div className={cx('params')}>
                  {datasetParam.map(({ key, value }, idx) => {
                    return (
                      <div key={idx} className={cx('item')}>
                        <label className={cx('param')}>{key}</label>
                        <span className={cx('value')}>{value}</span>
                      </div>
                    );
                  })}
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
          <div className={cx('btn-box')}>
            <div className={cx('log')} name={t('viewResult.label')}>
              <img
                src='/images/icon/ic-log.svg'
                alt='view_log'
                className={cx(
                  'btn',
                  !(data.status.status !== 'pending' && data.log_file) &&
                    'disabled',
                )}
                onClick={() => {
                  if (data.status.status !== 'pending' && data.log_file)
                    onViewLog(data, jobName);
                }}
              />
            </div>
            {trainingType === 'built-in' && (
              <div
                className={cx('deploy')}
                name={t('createDeploymentQuick.label')}
              >
                <img
                  src='/images/icon/icon-deployments-gray.svg'
                  alt='deploy'
                  className={cx(
                    'btn',
                    !(data.status.status !== 'pending' && checkpointIsOpen) &&
                      'disabled',
                  )}
                  onClick={() => {
                    onCreateDeployment(jobName, jobIdx);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListContent;
