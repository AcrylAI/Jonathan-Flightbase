// i18n
import { useTranslation } from 'react-i18next';

// Components
import CircleProgressbar from '@src/components/atoms/loading/CircleProgressbar';

// CSS module
import style from './AdminWorkspaceDetail.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const AdminWorkspaceDetail = ({ data, moreList }) => {
  const { t } = useTranslation();
  const {
    name,
    description,
    gpu,
    trainings,
    deployments,
    images,
    datasets,
    user: { list: userList, total: userTotal },
  } = data;
  return (
    <div className={cx('detail')}>
      <div className={cx('header')}>
        <h3 className={cx('title')}>{t('detailsOf.label', { name: name })}</h3>
        <p className={cx('desc')}>{description}</p>
      </div>
      <div className={cx('usage-div')}>
        <div className={cx('usage-chart')}>
          <div>
            <label className={cx('label')}>{t('gpusForTraining.label')}</label>
            <p className={cx('usage')}>
              {gpu.training.used}/{gpu.training.total}
            </p>
          </div>
          <div className={cx('graph')}>
            <CircleProgressbar
              total={gpu.training.total}
              used={gpu.training.used}
            />
          </div>
        </div>
        <div className={cx('usage-chart')}>
          <div>
            <label className={cx('label')}>
              {t('gpusForDeployment.label')}
            </label>
            <p className={cx('usage')}>
              {gpu.deployment.used}/{gpu.deployment.total}
            </p>
          </div>
          <div className={cx('graph')}>
            <CircleProgressbar
              total={gpu.deployment.total}
              used={gpu.deployment.used}
            />
          </div>
        </div>
        <div className={cx('users')}>
          <div>
            <label className={cx('label')}>
              {t('users.label')} ({userTotal})
            </label>
            <div className={cx('user-list')}>
              {userList.map(({ name: userName }, idx) =>
                idx === userList.length - 1 ? userName : `${userName}, `,
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={cx('block')}>
        <div className={cx('more-info')}>
          <div>
            <label
              className={cx('label')}
              name={t('goToTargetList.label', {
                target: t('training'),
              })}
            >
              {t('trainings.label')}
              <button
                className={cx('more')}
                onClick={() => moreList(name, 'trainings')}
              >
                <img src='/images/icon/ic-right-blue.svg' alt='>' />
              </button>
            </label>
          </div>
          <div className={cx('count')}>
            {t('ea.label', { count: trainings })}
          </div>
        </div>
        <div className={cx('more-info')}>
          <div>
            <label
              className={cx('label')}
              name={t('goToTargetList.label', {
                target: t('deployment'),
              })}
            >
              {t('deployments.label')}
              <button
                className={cx('more')}
                onClick={() => moreList(name, 'deployments')}
              >
                <img src='/images/icon/ic-right-blue.svg' alt='>' />
              </button>
            </label>
          </div>
          <div className={cx('count')}>
            {t('ea.label', { count: deployments })}
          </div>
        </div>
        <div className={cx('more-info')}>
          <div>
            <label
              className={cx('label')}
              name={t('goToTargetList.label', {
                target: t('docker image'),
              })}
            >
              {t('dockerImages.label')}
              <button
                className={cx('more')}
                onClick={() => moreList(name, 'docker_images')}
              >
                <img src='/images/icon/ic-right-blue.svg' alt='>' />
              </button>
            </label>
          </div>
          <div className={cx('count')}>{t('ea.label', { count: images })}</div>
        </div>
        <div className={cx('more-info')}>
          <div>
            <label
              className={cx('label')}
              name={t('goToTargetList.label', {
                target: t('dataset'),
              })}
            >
              {t('datasets.label')}
              <button
                className={cx('more')}
                onClick={() => moreList(name, 'datasets')}
              >
                <img src='/images/icon/ic-right-blue.svg' alt='>' />
              </button>
            </label>
          </div>
          <div className={cx('count')}>
            {t('ea.label', { count: datasets })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkspaceDetail;
