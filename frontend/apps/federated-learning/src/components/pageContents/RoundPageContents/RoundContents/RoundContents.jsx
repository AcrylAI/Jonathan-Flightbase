import { useHistory } from 'react-router-dom';

// Components
// import { Flow } from '@jonathan/ui-react';
import Flow from '@src/components/uiContents/Flow';
import { Button } from '@jonathan/ui-react';
import StageSpace from '../StageSpace';

// CSS Module
import classNames from 'classnames/bind';
import style from './RoundContents.module.scss';

const cx = classNames.bind(style);

function RoundContents({
  t,
  data,
  onOpenRoundModal,
  onStopRoundModal,
  stageData,
  roundName,
  theme,
  currStatus,
  roundProgressCurrentCount,
  roundProgressTotalCount,
  roundGroupName,
}) {
  const history = useHistory();
  return (
    <>
      <div className={cx('header-container')}>
        <div className={cx('header')}>
          <span className={cx('header-round')}>
            <Button
              type='text-underline'
              theme={theme}
              onClick={() => {
                history.push({
                  pathname: `/rounds/${roundName}/rounds`,
                  state: { groupId: roundGroupName },
                });
              }}
              size={'large'}
              customStyle={{ padding: 0 }}
            >
              {roundName !== 'null' &&
                t('round.version.label', { version: roundName })}
            </Button>
            <p className={cx('header-progress-count')}>
              {roundProgressTotalCount &&
                roundProgressTotalCount !== 1 &&
                `(${roundProgressCurrentCount} / ${roundProgressTotalCount})`}
            </p>
          </span>
          <span className={cx('header-buttons')}>
            <Button
              customStyle={{ borderRadius: '2px', marginRight: '10px' }}
              type='red'
              theme='jp-dark'
              children={t('round.stop.label')}
              onClick={() => onStopRoundModal()}
            />
            <Button
              customStyle={{ borderRadius: '2px', marginRight: '20px' }}
              type='primary'
              theme='jp-dark'
              children={t('round.nextRound.label')}
              onClick={() => onOpenRoundModal()}
            />
          </span>
        </div>
        <div className={cx('body-container')}>
          <div className={cx('stage-container')}>
            {stageData?.info && (
              <StageSpace t={t} stageData={stageData} currStatus={currStatus} />
            )}
          </div>
          {data ? (
            <Flow width={'100%'} height={'500px'} data={data.dataObj} />
          ) : (
            <div style={{ width: '100%', height: '500px' }}></div>
          )}
        </div>
      </div>
    </>
  );
}
export default RoundContents;
