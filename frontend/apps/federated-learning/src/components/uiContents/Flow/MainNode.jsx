import { memo, useState } from 'react';
import { Handle } from 'react-flow-renderer';

import aggregationIcon from '@src/static/images/icon/aggregationIcon.svg';
import sameArrow from '@src/static/images/icon/same_arrow.svg';
import lowArrow from '@src/static/images/icon/low_arrow.svg';
import highArrow from '@src/static/images/icon/high_arrow.svg';
import errorIcon from '@src/static/images/icon/error-icon.svg';

import style from './Flow.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(style);

export default memo((data) => {
  const {
    aggregationStatus,
    metrics,
    globalModelData,
    metricLabel,
    seedModelLabel,
    resultModelLabel,
    stageFailReason,
  } = data.data;
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <>
      <Handle
        type='target'
        position='left'
        id='left'
        style={{ width: 0, height: 0 }}
      />
      {globalModelData ? (
        <div className={cx('round-detail-aggregation')}>
          <div className={cx('round-detail-aggregation-cell-title')}>
            <p>{metricLabel}</p>
            <p>{seedModelLabel}</p>
            <p>
              {resultModelLabel}
              {aggregationStatus === 3 && (
                <img
                  className={cx('error-img')}
                  src={errorIcon}
                  alt='error-icon'
                  onMouseOver={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
              )}
              {showTooltip && stageFailReason && (
                <p className={cx('error-message')}>{stageFailReason}</p>
              )}
            </p>
          </div>
          <div className={cx('global-model-data')}>
            {globalModelData?.map((data) => {
              return (
                <div className={cx('global-model-data-div')} key={data.metric}>
                  <p>{data.metric}</p>
                  <p>{data.seedModel}</p>
                  <p>
                    {aggregationStatus === 3 ? '-' : data.resultModel}
                    {data.change_direction === 'same' && (
                      <img src={sameArrow} alt='same arrow' />
                    )}
                    {data.change_direction === 'lower' && (
                      <img src={lowArrow} alt='low arrow' />
                    )}
                    {data.change_direction === 'higher' && (
                      <img src={highArrow} alt='high arrow' />
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className={cx(
            aggregationStatus === 2 && 'complete',
            aggregationStatus === 1 && 'block',
            'mainNode-container',
          )}
        >
          <div className={cx('aggregation-div')}>
            <div style={{ display: 'grid' }}>
              {aggregationStatus === 3 ? (
                <img
                  className={cx('aggregation-img')}
                  src={errorIcon}
                  alt='aggregation icon'
                />
              ) : (
                <img
                  className={cx('aggregation-img')}
                  src={aggregationIcon}
                  alt='aggregation icon'
                />
              )}
              {aggregationStatus === 3 && (
                <p className={cx('error-message')}>{stageFailReason}</p>
              )}
            </div>

            <p className={cx('aggregation-text')}>Aggregation</p>
          </div>
          {metrics && (
            <div className={cx('round-metrics')}>
              {metrics?.map((data) => {
                return (
                  <div className={cx('round-metrics-div')} key={data.key}>
                    <p className={cx('round-metrics-key')}>{data.key}</p>
                    <p className={cx('round-metrics-value')}>{data.value}</p>
                    {data.change_direction === 'same' && (
                      <img src={sameArrow} alt='same arrow' />
                    )}
                    {data.change_direction === 'lower' && (
                      <img src={lowArrow} alt='low arrow' />
                    )}
                    {data.change_direction === 'higher' && (
                      <img src={highArrow} alt='high arrow' />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <Handle
        type='source'
        position='right'
        id='right'
        style={{ width: 0, height: 0 }}
      />
    </>
  );
});
