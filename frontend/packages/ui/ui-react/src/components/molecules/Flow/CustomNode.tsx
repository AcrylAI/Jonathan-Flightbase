import { memo } from 'react';

import { Handle } from 'react-flow-renderer';

// Icons
import defaultLogo from '@src/static/images/icons/Vector.svg';
import broadcastingSuccess from '@src/static/images/icons/broadcastingSuccess.svg';
import errorIcon from '@src/static/images/icons/error-icon.svg';

import style from './Flow.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

export default memo(({ data, isConnectable }: any) => {
  let colorClass = '';
  if (data.testStatus === 2 && data.trainingStatus === 2) {
    colorClass = 'darkLime';
  } else if (data.testStatus < 2 && data.trainingStatus <= 2) {
    colorClass = 'blue';
  }
  return (
    <>
      <div className={cx('span-container')}>
        <div className={cx('client-thumbnail-container')}>
          <p className={cx('client-thumbnail-name')}>
            {data.clientName?.charAt(0)}
          </p>
        </div>
        <p className={cx('client-name')}>{data.clientName}</p>
        <div>
          {data.dotPosition === 'right' &&
            data.trainingStatus !== 3 &&
            (data.metrics ? (
              <div className={cx('box', colorClass)}>
                <p className={cx('client-number')}>
                  {data.metrics && data.metrics}
                </p>
              </div>
            ) : (
              <div className={cx('box', colorClass)}>
                <div className={cx('container')}>
                  <span className={cx('circle')}></span>
                  <span className={cx('circle')}></span>
                  <span className={cx('circle')}></span>
                </div>
              </div>
            ))}
          {data.trainingStatus === 3 && (
            <div className={cx('error-status-icon')}>
              <img src={errorIcon} alt='' />
            </div>
          )}
          {data.dotPosition === 'left' && data.broadcastingStatus === 2 && (
            <div className={cx('status-icon')}>
              <img src={broadcastingSuccess} alt='' />
            </div>
          )}
        </div>
      </div>
      <Handle
        type={data.dotPosition === 'right' ? 'source' : 'target'}
        position={data.dotPosition}
        id='clientNode'
        isConnectable={isConnectable}
      />
    </>
  );
});
