import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import ColumnChart from '@src/components/uiContents/charts/ColumnChart';
import { Button, Tooltip } from '@jonathan/ui-react';

// Icons
import IconImageArrow from '@images/icon/ic-arrow-right-blue.svg.svg';
import NoColumnChart from '@images/icon/ic-empty-columnchart.svg';
import InfoIcon from '@images/icon/ic-info-gray.svg';

// Utils
import { numberWithCommas } from '@src/utils/utils';

// Colors
import { colors } from '@src/utils/colors';

// CSS Module
import classNames from 'classnames/bind';
import style from './TrainingResult.module.scss';
const cx = classNames.bind(style);

function TrainingResult({
  idx,
  clientName,
  startDatetime,
  endDatetime,
  metricsKey,
  metrics,
  dataCount,
  trainingLog,
}) {
  const scrollRef = useRef(null);
  const { t } = useTranslation();
  // const contentsRef = useRef(null);
  const { theme } = useSelector(({ theme }) => theme);
  const [detailOpen, setDetailOpen] = useState(false);
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

  // useEffect(() => {
  //   const contents = contentsRef.current;
  //   if (contents) {
  //     contents.scrollTo({ top: 0, behavior: 'smooth' });
  //   }
  // }, []);

  /**
   * 클래스별 학습 데이터 수 차트에 들어갈 정보 가공
   */
  useEffect(() => {
    if (dataCount?.data) {
      let total = 0;
      const trainedDataByLabel = dataCount?.data;
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
      setTrainedDataByLabel(trainedDataByLabel);
      setTrainedDataByLabelTotal(total);
      setTrainedDataByLabelAverage(avg);
      setTrainedDataByLabelMax(max);
      setTrainedDataByLabelMin(min);
      setTrainedDataByLabelMaxClasses(maxClasses);
      setTrainedDataByLabelMinClasses(minClasses);
      setTrainedDataByLabelClassCount(classCount);
    }
  }, [dataCount]);

  useEffect(() => {
    if (detailOpen) {
      scrollRef.current[idx]?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [detailOpen, idx]);

  return (
    <>
      <li
        className={cx(
          'contents',
          detailOpen && 'open-info',
          `metric-size-${metricsKey.length}`,
        )}
        ref={scrollRef}
      >
        <div
          className={cx('first')}
          ref={(el) => {
            scrollRef.current && (scrollRef.current[idx] = el);
          }}
        >
          {clientName}
        </div>
        {startDatetime || '0000-00-00 00:00:00'} -{' '}
        {endDatetime || '0000-00-00 00:00:00'}
        <div className={cx('metric-column')}>
          {metricsKey.map((key, idx) => (
            <label key={idx}>{metrics[key]}</label>
          ))}
        </div>
        <div className={cx('detail-btn')}>
          <Button
            type='text-underline'
            theme={theme}
            customStyle={{
              height: '72px',
              lineHeight: '72px',
            }}
            icon={IconImageArrow}
            iconAlign='right'
            iconStyle={{
              transform: detailOpen
                ? 'rotate(270deg) translateY(-2px)'
                : 'rotate(90deg) translateY(2px)',
            }}
            onClick={() => {
              setDetailOpen(!detailOpen);
            }}
          >
            {t('seeDetail.label')}
          </Button>
        </div>
      </li>
      {/* See details(상세보기) 클릭 시 open된 영역 */}
      {detailOpen && (
        <div className={cx('detail')}>
          <div className={cx('title-area')}>
            <div className={cx('title')}>
              {t('roundDetail.trainedDataCountByClass.label')}
            </div>
            <div className={cx('class-count')}>
              {t('classCount.label')}: {trainedDataByLabelClassCount}
            </div>
          </div>
          <div className={cx('chart-area')}>
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
                tagId={`columchartdiv${idx}`}
                data={trainedDataByLabel}
                average={trainedDataByLabelAverage}
                min={trainedDataByLabelMin}
                max={trainedDataByLabelMax}
                customStyle={{
                  width: '100%',
                  height: '344px',
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
          <div className={cx('title-area')}>
            <div className={cx('title')}>{t('roundDetail.trainLog.label')}</div>
          </div>
          <div className={cx('log-area')}>
            {trainingLog ? (
              trainingLog.map((t, idx) => <span key={idx}>{t}</span>)
            ) : (
              <div className={cx('no-data-box')}>
                {t('roundDetail.noData.message')}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default TrainingResult;
