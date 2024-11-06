import { Fragment } from 'react';
import { useSelector } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// ui-react
import { Button, Emptybox, Loading } from '@jonathan/ui-react';

// CSS Module
import classNames from 'classnames/bind';
import style from './JoinRequestsModalContents.module.scss';
const cx = classNames.bind(style);

function JoinRequestsModalContents({
  isLoading,
  joinRequestsData,
  onAccept,
  onDecline,
}) {
  const { t } = useTranslation();
  const { theme } = useSelector(({ theme }) => theme);

  if (!isLoading && joinRequestsData.length === 0) {
    return (
      <Emptybox
        text={t('clients.table.noRequestFound.message')}
        customStyle={{
          height: '231px',
        }}
        theme={theme}
      />
    );
  }

  return (
    <div className={cx('joined-request-card')}>
      {isLoading ? (
        <Loading />
      ) : (
        joinRequestsData.map((data, idx) => {
          const { address, joinRequestDateTime, message } = data;
          return (
            <Fragment key={idx}>
              <div className={cx('card-area')}>
                <div className={cx('card')}>
                  <div>
                    <span>{t('address.label')}</span>
                    <label>{address}</label>
                  </div>
                  <div>
                    <span>{t('requestTime.label')}</span>
                    <label>{joinRequestDateTime}</label>
                  </div>
                  <div>
                    <span>{t('message.label')}</span>
                    <label>{message ? message : '-'}</label>
                  </div>
                  <div className={cx('btn')}>
                    <Button
                      type='none-border'
                      theme={theme}
                      onClick={() => {
                        onDecline(address);
                      }}
                    >
                      {t('decline.label')}
                    </Button>
                    <Button
                      theme={theme}
                      onClick={() => {
                        onAccept(address);
                      }}
                    >
                      {t('accept.label')}
                    </Button>
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })
      )}
    </div>
  );
}

export default JoinRequestsModalContents;
