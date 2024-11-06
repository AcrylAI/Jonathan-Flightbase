/* eslint-disable react/no-danger */

// i18n
import { withTranslation } from 'react-i18next';

// Components
import { Progress } from 'react-sweet-progress';
import 'react-sweet-progress/lib/style.css';
import { Badge } from '@jonathan/ui-react';

// CSS module
import style from './LatestJob.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const LatestJob = ({
  name,
  trainingId,
  trainingName,
  status,
  count,
  progress,
  moveJobList,
  type,
  t,
}) => {
  return (
    <div className={cx('history-row')}>
      <div className={cx('content')}>
        <div className={cx('type')}>
          <Badge
            label={type.toUpperCase()}
            type={type === 'job' ? 'green' : 'blue'}
          />
        </div>
        <label
          className={cx('name')}
          title={`${t('training.label')}: ${trainingName}\n${t(
            'job.label',
          )}: ${name}`}
        >
          <span>[</span>
          <span className={cx('training')}>{trainingName}</span>
          <span>]</span>
          <span className={cx('job')}>{name}</span>
        </label>
        <div className={cx('progress')}>
          <Progress
            percent={progress}
            status={status === 'running' ? 'active' : 'default'}
            theme={{
              active: {
                symbol: '',
                color: '#02e366',
                trailColor: '#dbdbdb',
              },
              default: {
                symbol: '',
                color: '#c1c1c1',
                trailColor: '#dbdbdb',
              },
            }}
          />
        </div>
        <div className={cx('status')}>
          <div>
            <label className={cx('label', 'status-label', status)}>
              {t(status)}
            </label>
            <span className={cx('value', 'status-count')}>
              ({count.done + count.running}/{count.total})
            </span>
          </div>
          <div>
            <label className={cx('label')}>{t('pending')}</label>
            <span className={cx('value')}>{count.pending}</span>
            <label className={cx('label')}>{t('done')}</label>
            <span className={cx('value')}>{count.done}</span>
          </div>
        </div>
      </div>
      <button
        className={cx('btn-box')}
        name={t('goToTargetList.label', { target: type.toUpperCase() })}
      >
        <img
          className={cx('arrow')}
          src='/images/icon/prev-right.svg'
          alt='>'
          onClick={() => moveJobList(trainingId, trainingName, type)}
        />
      </button>
    </div>
  );
};

export default withTranslation()(LatestJob);
