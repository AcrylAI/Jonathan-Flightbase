// i18n
import { useTranslation } from 'react-i18next';

// CSS Module
import style from './AdminGroupDetail.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const AdminGroupDetail = ({ name, description, userNameList }) => {
  const { t } = useTranslation();
  return (
    <div className={cx('detail')}>
      <div className={cx('header')}>
        <h3 className={cx('title')}>
          {t('detailsOf.label', {
            name: name,
          })}
        </h3>
        <p className={cx('desc')}>{description || '-'}</p>
      </div>
      <div className={cx('block')}>
        {userNameList.length === 0 ? (
          t('noUserList.message')
        ) : (
          <>
            <label className={cx('block-title')}>{t('userList.label')}</label>
            <p className={cx('user-list')}>{userNameList.join(', ')}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminGroupDetail;
