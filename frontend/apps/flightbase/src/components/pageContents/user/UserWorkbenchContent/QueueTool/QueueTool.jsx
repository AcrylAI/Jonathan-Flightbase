import { useParams, useHistory } from 'react-router-dom';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Progress } from 'react-sweet-progress';
import 'react-sweet-progress/lib/style.css';

// types
import { TRAINING_TOOL_TYPE } from '@src/types';

// CSS Module
import classNames from 'classnames/bind';
import style from './QueueTool.module.scss';

const cx = classNames.bind(style);

function QueueTool({ toolList, isHideExplanation }) {
  // Router Hooks
  const history = useHistory();
  const { id: workspaceId, tid: trainingId } = useParams();

  /**
   * Job/HPS 목록으로 이동
   */
  const moveToList = (type) => {
    history.push({
      pathname: `/user/workspace/${workspaceId}/trainings/${trainingId}/workbench/${type}`,
    });
  };

  const { t, i18n } = useTranslation();
  return (
    <div className={cx('queue-tool-box')}>
      <h2 className={cx('tool-title')}>{t('queueTool.label')}</h2>
      <div className={cx('tool-list')}>
        {toolList &&
          toolList.map(
            (
              {
                tool_type: type,
                tool_type_name: typeName,
                progress: { progress, status },
                tool_status: toolStatus,
              },
              idx,
            ) => {
              return (
                <div
                  key={idx}
                  className={cx('card-box', 'disabled')}
                  // onClick={() => moveToList(typeName)}
                >
                  <div className={cx('header', isHideExplanation && 'no-desc')}>
                    <div className={cx('icon', typeName)}>
                      <img
                        src={`/images/icon/ic-${typeName}.svg`}
                        alt={`${typeName} icon`}
                      />
                    </div>
                    <label className={cx('label')}>
                      {TRAINING_TOOL_TYPE[type].label}
                    </label>
                    <img
                      className={cx('arrow-icon')}
                      src='/images/icon/ic-arrow-right-blue.svg'
                      alt='>'
                    />
                  </div>
                  {!isHideExplanation && (
                    <div className={cx('body')}>
                      <p className={cx('description')}>
                        {TRAINING_TOOL_TYPE[type].explanation[i18n.language]}
                      </p>
                    </div>
                  )}
                  <div className={cx('background')} />

                  <span className={cx('later')}>{t('toBeRevealed.label')}</span>

                  <div className={cx('footer')}>
                    <div className={cx('progress')}>
                      <div className={cx('progress-inner-box')}>
                        <span
                          className={cx('progress-label', toolStatus.status)}
                        ></span>
                        <span
                          className={cx('progress-status', toolStatus.status)}
                        >
                          {status.total - status.pending}/{status.total}
                        </span>
                      </div>
                      <Progress
                        percent={progress}
                        status={
                          toolStatus.status !== 'stop'
                            ? toolStatus.status
                            : 'default'
                        }
                        theme={{
                          running: {
                            symbol: '',
                            color: '#2d76f8',
                            trailColor: '#dee9ff',
                          },
                          default: {
                            symbol: '',
                            color: '#c1c1c1',
                            trailColor: '#dbdbdb',
                          },
                          pending: {
                            symbol: '',
                            color: '#ffc500',
                            trailColor: '#fff8d9',
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            },
          )}
      </div>
    </div>
  );
}

export default QueueTool;
