// i18n
import { useTranslation } from 'react-i18next';

// CSS module
import style from './AdminUserDetail.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const AdminUserDetail = ({ data, moreList }) => {
  const { t } = useTranslation();
  const { name, workspaces, trainings, deployments, images, datasets } = data;
  return (
    <div className={cx('detail')}>
      <div className={cx('header')}>
        <h3 className={cx('title')}>{t('detailsOf.label', { name: name })}</h3>
      </div>
      <div className={cx('block')}>
        <div className={cx('more-info')}>
          <label
            className={cx('label')}
            name={t('goToTargetList.label', {
              target: t('workspace'),
            })}
          >
            {t('workspaces.label')}
            <button
              className={cx('more')}
              onClick={() => moreList(name, 'workspaces')}
            >
              <img src='/images/icon/ic-right-blue.svg' alt='>' />
            </button>
          </label>
          <div className={cx('count')}>
            {t('includedCount.label', { count: workspaces })}
          </div>
        </div>
        <div className={cx('more-info')}>
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
          <div className={cx('count')}>
            {t('accessibleCount.label', { count: trainings })}
          </div>
        </div>
        <div className={cx('more-info')}>
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
          <div className={cx('count')}>
            {t('accessibleCount.label', { count: deployments })}
          </div>
        </div>
        <div className={cx('more-info')}>
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
          <div className={cx('count')}>
            {t('createdCount.label', { count: images })}
          </div>
        </div>
        <div className={cx('more-info')}>
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
          <div className={cx('count')}>
            {t('createdCount.label', { count: datasets })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
