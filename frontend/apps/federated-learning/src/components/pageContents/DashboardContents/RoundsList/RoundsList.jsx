import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

// Icon
import ArrowGray from '@images/icon/ic-arrow-gray.svg';
import ArrowGreen from '@images/icon/ic-arrow-green.svg';
import ArrowYellow from '@images/icon/ic-arrow-yellow.svg';

// i18n
import { useTranslation } from 'react-i18next';

import { StatusCard } from '@jonathan/ui-react';

// CSS module
import style from './RoundsList.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function RoundsList({
  number,
  client,
  progressStage,
  state,
  status,
  metrics,
  stage,
  name,
  roundsClickHandler,
}) {
  const { t } = useTranslation();
  const { theme } = useSelector((root) => root.theme);

  // State
  const [arrowColor, setArrowColor] = useState(ArrowGray);
  useEffect(() => {
    let color = ArrowGray;

    if (progressStage.dir === 'higher') {
      color = ArrowGreen;
    } else if (progressStage.dir === 'lower') {
      color = ArrowYellow;
    }
    setArrowColor(color);
  }, [progressStage]);

  return (
    <div
      className={cx('rounds-wrap')}
      onClick={() => roundsClickHandler(number, status, name)}
    >
      <div className={cx('number')}>#{number}</div>
      <div className={cx('client')}>
        {client} {t('clients.label')}
      </div>
      <div className={cx('result-wrap', status !== 'complete' && 'card')}>
        {status === 'complete' ? (
          <>
            <div className={cx('result')}>{progressStage.acc}</div>
            {progressStage?.dir && <img src={arrowColor} alt='status' />}
          </>
        ) : (
          <StatusCard
            status={status === 'active' ? 'training' : status}
            text={stage}
            size='small'
            theme={theme}
            customStyle={{ cursor: 'pointer' }}
          />
        )}
      </div>
    </div>
  );
}
export default RoundsList;
