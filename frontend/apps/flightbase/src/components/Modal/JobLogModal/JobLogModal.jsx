// i18n
import { useTranslation } from 'react-i18next';

// Custom Hooks
import useWindowDimensions from '@src/hooks/useWindowDimensions';

// Components
import ModalFrame from '../ModalFrame';
import { Button } from '@jonathan/ui-react';
import AccuracyLossChart from '@src/components/molecules/chart/AccuracyLossChart';
import Status from '@src/components/atoms/Status';

// Icon
import download from '@src/static/images/icon/00-ic-data-download-white.svg';

// CSS module
import classNames from 'classnames/bind';
import style from './JobLogModal.module.scss';
const cx = classNames.bind(style);

const JobLogModal = ({
  validate,
  data,
  type,
  logData,
  totalLength,
  jobName,
  jobData,
  jobStatus,
  downloadLog,
  metricsData,
  metricsInfo,
  parameterSettings,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { submit, trainingName } = data;
  const newSubmit = {
    text: submit.text,
    func: async () => {
      const res = await onSubmit(submit.func);
      return res;
    },
  };
  const { width } = useWindowDimensions();
  return (
    <ModalFrame
      submit={newSubmit}
      type={type}
      validate={validate}
      isResize={true}
      isMinimize={true}
      title={`[${trainingName}] ${t('trainingResultOf.label', {
        name: `${jobName}-${jobData.index + 1}`,
      })}`}
      customStyle={{
        width: width > 1920 ? '1800px' : width > 1200 ? '1200px' : '780px',
      }}
    >
      <h2 className={cx('title')}>
        <Status status={jobStatus} />
        {`[${trainingName}] ${t('trainingResultOf.label', {
          name: `${jobName}-${jobData.index + 1}`,
        })}`}
      </h2>
      <div className={cx('form')}>
        <div className={cx('parameter-box')}>
          <h3 className={cx('sub-title')}>{t('parameterSettings.label')}</h3>
          <div className={cx('parameter')}>
            {parameterSettings.length > 0
              ? parameterSettings.map(({ key, value }, idx) => (
                  <div key={idx}>
                    <label className={cx('label')}>{key}</label>
                    <span className={cx('value')}>{value}</span>
                  </div>
                ))
              : '-'}
          </div>
        </div>
        <div className={cx('chart')}>
          <h3 className={cx('sub-title')}>{t('graph.label')}</h3>
          <AccuracyLossChart
            data={metricsData}
            info={metricsInfo}
            width={width > 1920 ? 1712 : width > 1200 ? 1112 : 698}
            height={400}
          />
        </div>
        <div className={cx('log')}>
          <h3 className={cx('sub-title')}>{t('log.label')}</h3>
          <div className={cx('download')}>
            <Button
              type='secondary'
              icon={download}
              iconAlign='right'
              onClick={() => downloadLog(jobData.index + 1)}
            >
              {t('logDownload.label')}
            </Button>
          </div>
        </div>
        <div className={cx('row')}>
          {(() => {
            const arr = [];
            for (let i = 0; i < logData.length; i += 1) {
              if (totalLength > 200 && i === 100) {
                arr.push(
                  <p key='ellipsis' className={cx('ellipsis')}>
                    .<br />.<br />.<br />
                  </p>,
                );
              }
              if (logData[i].length === 0) {
                arr.push(<br key={i} />);
              } else {
                arr.push(<p key={i}>{logData[i]}</p>);
              }
            }
            return arr;
          })()}
        </div>
      </div>
    </ModalFrame>
  );
};

export default JobLogModal;
