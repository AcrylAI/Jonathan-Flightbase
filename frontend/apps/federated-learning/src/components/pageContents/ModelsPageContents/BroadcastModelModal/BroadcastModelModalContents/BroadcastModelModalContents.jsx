import { useSelector } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Checkbox, StatusCard } from '@jonathan/ui-react';

// CSS Module
import className from 'classnames/bind';
import style from './BroadcastModelModalContents.module.scss';
const cx = className.bind(style);

function BroadcastModelModalContents(contentsProps) {
  const { t } = useTranslation();
  const { theme } = useSelector(({ theme }) => theme);
  const {
    version,
    clientList,
    onChangeClientList,
    allChecked,
    onChangeAllChecked,
  } = contentsProps;

  return (
    <div className={cx('modal-contents')}>
      <div className={cx('selected-model')}>
        <label>{t('model.modal.selectedModelVersion.label')}</label>
        <span>{t('round.version.label', { version })}</span>
      </div>
      <div className={cx('client-list')}>
        <div className={cx('list-header')}>
          <div className={cx('checkbox')}>
            <Checkbox
              label={''}
              checked={allChecked}
              onChange={() => {
                onChangeAllChecked(allChecked);
              }}
              theme={theme}
            />
          </div>
          <div className={cx('client')}>{t('model.modal.clients.label')}</div>
          <div className={cx('status')}>
            {t('model.modal.connection.label')}
          </div>
        </div>
        {clientList &&
          clientList.map(({ client_name, connection, checked }, idx) => {
            return (
              <div className={cx('list-item')} key={idx}>
                <div className={cx('checkbox')}>
                  <Checkbox
                    label={''}
                    checked={checked}
                    onChange={() => {
                      onChangeClientList(idx);
                    }}
                    disabled={connection.toLowerCase() !== 'connected'}
                    theme={theme}
                  />
                </div>
                <div className={cx('client')}>{client_name}</div>
                <div className={cx('status')}>
                  <StatusCard
                    status={connection.toLowerCase()}
                    text={t(`${connection.toLowerCase()}.label`)}
                    size='small'
                    theme={theme}
                    customStyle={{ width: 'max-content' }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default BroadcastModelModalContents;
