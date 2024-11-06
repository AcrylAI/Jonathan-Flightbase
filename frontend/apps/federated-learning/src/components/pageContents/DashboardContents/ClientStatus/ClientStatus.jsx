// i18n
import { useTranslation } from 'react-i18next';

// CSS module
import style from './ClientStatus.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function ClientStatus({ clientStatus, clientsData }) {
  const { t } = useTranslation();

  return (
    <div className={cx('clients-wrap')}>
      <span className={cx('status')}>{t(`${clientStatus?.status}.label`)}</span>
      <span
        className={cx('number')}
        style={{
          color:
            clientsData[clientStatus?.status] === 0 || !clientsData
              ? '#c2c2c2'
              : clientStatus?.color,
        }}
      >
        {clientsData[clientStatus?.status] || 0}
      </span>
    </div>
  );
}

export default ClientStatus;
