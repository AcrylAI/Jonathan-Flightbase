import { connect } from 'react-redux';

// Components
import Card from './Card';
import Loading from '@src/components/atoms/loading/Loading';

// Icons
import RefreshIcon from '@src/static/images/icon/refresh.svg';

// i18n
import { useTranslation } from 'react-i18next';

// CSS module
import style from './UserDashboardContent.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function UserDashboardContent({
  data,
  loading,
  onRefresh,
  moveWorkspace,
  nav: { isExpand },
  serverError,
  auth: { userName, jpUserName },
}) {
  const { t } = useTranslation();
  const workspaceList = data.map((list, index) => (
    <Card
      key={index}
      data={list}
      moveWorkspace={moveWorkspace}
      onRefresh={onRefresh}
    />
  ));
  return (
    <div id='UserDashboardContent' className={cx('dashboard')}>
      <div className={cx('header', isExpand && 'expand')}>
        <h1 className={cx('welcome')}>
          {t('welcomeBack.message')} {jpUserName || userName}
          {t('sir.label')}!
        </h1>
        <button
          className={cx('refresh', loading && 'loading')}
          onClick={onRefresh}
        >
          <img src={RefreshIcon} alt='refresh' />
          {t('refresh.label')}
        </button>
      </div>
      <div className={cx('content')}>
        {loading ? (
          <div className={cx('loading-container')}>
            <Loading />
          </div>
        ) : serverError ? (
          <div className={cx('no-response')}>{t('noResponse.message')}</div>
        ) : data.length > 0 ? (
          <div className={cx('card-box')} data-testid='user-dashboard-ws-list'>
            {workspaceList}
          </div>
        ) : (
          <div className={cx('no-data')}>{t('noWorkspace.message')}</div>
        )}
      </div>
    </div>
  );
}

export default connect(({ nav, auth }) => ({ nav, auth }))(
  UserDashboardContent,
);
