// i18n
import { useTranslation } from 'react-i18next';

// Components
import CircleProgressbar from '@src/components/atoms/loading/CircleProgressbar';
import Status from '@src/components/atoms/Status';
import { Tooltip } from '@jonathan/ui-react';

// Icons
import TrainingIcon from '@src/static/images/icon/icon-trainings-gray.svg';
import DeploymentIcon from '@src/static/images/icon/icon-deployments-gray.svg';
import DockerImageIcon from '@src/static/images/icon/icon-docker_images-gray.svg';
import DatasetIcon from '@src/static/images/icon/icon-datasets-gray.svg';
import BookmarkIcon from '@src/static/images/icon/ic-star-o.svg';
import BookmarkActiveIcon from '@src/static/images/icon/ic-star.svg';

// Utils
import { convertLocalTime } from '@src/datetimeUtils';
import { errorToastMessage } from '@src/utils';

// Network
import { callApi, STATUS_SUCCESS } from '@src/network';

// CSS module
import style from './Card.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const ADMIN_EMAIL = import.meta.env.VITE_REACT_APP_ADMIN_EMAIL;

function Card({ data, moveWorkspace, onRefresh }) {
  const { t } = useTranslation();
  const {
    id,
    gpu,
    status,
    name,
    description,
    manager,
    user,
    trainings,
    deployments,
    images,
    datasets,
    start_datetime: startDate,
    end_datetime: endDate,
    favorites,
  } = data;

  // 워크스페이스 별표 활성화(즐겨찿기)
  const setBookmark = async (id, action) => {
    const response = await callApi({
      url: 'workspaces/favorites',
      method: 'post',
      body: {
        workspace_id: id,
        action,
      },
    });
    const { status, error, message } = response;
    if (status === STATUS_SUCCESS) {
      onRefresh();
    } else {
      errorToastMessage(error, message);
    }
  };

  return (
    <div
      className={cx('card')}
      onClick={(e) => {
        if (status === 'expired' || e.target.closest('.event-block')) {
          return;
        }
        moveWorkspace(data);
      }}
    >
      <div className={cx('contents-box')}>
        <div className={cx('header')}>
          <span
            className={`${cx('bookmark-btn')} event-block`}
            onClick={() => setBookmark(id, favorites === 1 ? 0 : 1)}
          >
            <img
              className={cx('ic-star', favorites === 1 && 'active')}
              src={favorites === 1 ? BookmarkActiveIcon : BookmarkIcon}
              alt='bookmark'
            />
          </span>
          <Status status={status} size='small' />
          <div className={cx('name-box')}>
            <div className={cx('workspace-name')}>{name}</div>
            <Tooltip
              title={name}
              contents={
                <div className={cx('tooltip-contents')}>
                  {description && (
                    <div className={cx('description')}>{description}</div>
                  )}
                  <ul>
                    <li>
                      <label className={cx('label')}>
                        {t('workspaceManager.label')}
                        {': '}
                      </label>
                      <span className={cx('value')}>{manager}</span>
                    </li>
                    <li>
                      <label className={cx('label')}>
                        {t('user.label')}({user.total}){': '}
                      </label>
                      <span className={cx('value')}>
                        {user.list
                          .map(({ name }) => {
                            return name;
                          })
                          .join(', ')}
                      </span>
                    </li>
                  </ul>
                </div>
              }
              contentsAlign={{
                horizontal:
                  name.length > 15
                    ? 'right'
                    : name.length > 5
                    ? 'center'
                    : 'left',
              }}
            />
          </div>
          <div className={cx('datetime')}>
            {convertLocalTime(startDate, 'YYYY-MM-DD HH:mm')} ~{' '}
            {convertLocalTime(endDate, 'YYYY-MM-DD HH:mm')}
          </div>
        </div>
        <div className={cx('body')}>
          <div className={cx('usage-chart')}>
            <div className={cx('graph')}>
              <CircleProgressbar
                total={gpu.training.total}
                used={gpu.training.used}
              />
            </div>
            <div className={cx('usage-text-box')}>
              <label className={cx('label')}>
                {t('gpusForTraining.label')}
              </label>
              <p className={cx('usage')}>
                {gpu.training.used}/{gpu.training.total}
              </p>
            </div>
          </div>
          <div className={cx('usage-chart')}>
            <div className={cx('graph')}>
              <CircleProgressbar
                total={gpu.deployment.total}
                used={gpu.deployment.used}
              />
            </div>
            <div className={cx('usage-text-box')}>
              <label className={cx('label')}>
                {t('gpusForDeployment.label')}
              </label>
              <p className={cx('usage')}>
                {gpu.deployment.used}/{gpu.deployment.total}
              </p>
            </div>
          </div>
        </div>
        <div className={cx('footer')}>
          <div className={cx('items')}>
            <label>
              <img className={cx('icon')} src={TrainingIcon} alt='trainings' />
              {t('trainings.label')}
            </label>
            <p className={cx('count')}>{trainings}</p>
          </div>
          <div className={cx('items')}>
            <label>
              <img
                className={cx('icon')}
                src={DeploymentIcon}
                alt='deployments'
              />
              {t('deployments.label')}
            </label>
            <p className={cx('count')}>{deployments}</p>
          </div>
          <div className={cx('items')}>
            <label>
              <img
                className={cx('icon')}
                src={DockerImageIcon}
                alt='dockerImages'
              />
              {t('dockerImages.label')}
            </label>
            <p className={cx('count')}>{images}</p>
          </div>
          <div className={cx('items')}>
            <label>
              <img className={cx('icon')} src={DatasetIcon} alt='datasets' />
              {t('datasets.label')}
            </label>
            <p className={cx('count')}>{datasets}</p>
          </div>
        </div>
      </div>
      {status === 'expired' && (
        <div className={cx('expired-dim')}>
          <img src='/images/icon/ic-warning-red.svg' alt='Access Denied' />
          <div>{t('workspaceExpired.title')}</div>
          <div className={cx('message')}>
            {ADMIN_EMAIL
              ? `${t('workspaceExpired.message', { email: ADMIN_EMAIL })}`
                  .split('\n')
                  .map((text, i) => (
                    <p key={i}>
                      {text} <br />
                    </p>
                  ))
              : `${t('workspaceExpiredNoEmail.message', { name: manager })}`
                  .split('\n')
                  .map((text, i) => (
                    <p key={i}>
                      {text} <br />
                    </p>
                  ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Card;
