// i18n
import { useTranslation } from 'react-i18next';

// Components
import Status from '@src/components/atoms/Status';

// Utils
import { convertLocalTime, convertDuration } from '@src/datetimeUtils';

// CSS module
import classNames from 'classnames/bind';
import style from './Card.module.scss';

const cx = classNames.bind(style);

const Card = ({ data }) => {
  const { t } = useTranslation();
  const {
    workspace_name: workspaceName,
    start_datetime: start,
    end_datetime: end,
    gpu_allocations: gpuAllocations,
    activation_time: activationTime,
    // usage_storage: usageStorage,
    uptime_of_cpu: uptimeOfCpu,
    status,
  } = data;

  // test(Number(activationTime), 'h');

  return (
    <li className={cx('card')}>
      <div className={cx('left-box')}>
        <Status status={status} size='small' />
        <p className={cx('name')}>{workspaceName}</p>
        <span className={cx('range')}>
          {convertLocalTime(start, 'YYYY-MM-DD HH:mm')} ~{' '}
          {convertLocalTime(end, 'YYYY-MM-DD HH:mm')}
        </span>
      </div>
      <div className={cx('right-box')}>
        <div className={cx('info-item')}>
          <p className={cx('label')}>
            <img src='/images/icon/ic-workspace.svg' alt='' />
            <label>{t('activationTime.label')}</label>
          </p>
          <span className={cx('val')}>
            {convertDuration(Number(activationTime), 'h')}
          </span>
        </div>
        <div className={cx('info-item')}>
          <p className={cx('label')}>
            <img src='/images/icon/ic-cpu.svg' alt='' />
            <label>{t('uptimeOfCpu.label')}</label>
          </p>
          <span className={cx('val')}>
            {convertDuration(Number(uptimeOfCpu), 'largeHour')}
          </span>
        </div>
        <div className={cx('info-item')}>
          <p className={cx('label')}>
            <img src='/images/icon/ic-gpu.svg' alt='' />
            <label>{t('gpuAllocations.label')}</label>
          </p>
          <span className={cx('val')}>{gpuAllocations} GPUs</span>
        </div>
        {/* <div className={cx('info-item')}>
          <p className={cx('label')}>
            <img src='/images/icon/ic-storage.svg' alt='' />
            <label>Usage of Storage</label>
          </p>
          <span className={cx('val')}>{usageStorage}GB</span>
        </div> */}
      </div>
    </li>
  );
};

export default Card;
