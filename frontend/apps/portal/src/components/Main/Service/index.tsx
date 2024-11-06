/* eslint-disable @next/next/no-img-element */
import { signIn, useSession } from 'next-auth/react';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import ServiceCard from './components/ServiceCard';

// shared
import { AUTH_STRING } from '@src/shared/globalDefine';

// Style
import styles from './index.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

// Images
const DatascopeLogo = '/Images/logo/BI_Datascope.svg';
const IntelligenceLogo = '/Images/logo/BI_Intelligence.svg';
const FlightbaseLogo = '/Images/logo/BI_Flightbase.svg';
const MarkerLogo = '/Images/logo/BI_Marker.svg';
const BotsLogo = '/Images/logo/BI_Nubot.svg';
const closeIcon = '/Images/00-ic-basic-close.svg';
const DatascopeProduct = '/Images/graph.svg';
const PlatformProduct = '/Images/devops.svg';
const BotsProduct = '/Images/invalid-name.svg';

function Index() {
  const { t } = useTranslation();
  const { status } = useSession();

  const handleServiceClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = e.target as HTMLAnchorElement;
    if (target.classList.contains(cx('deactive'))) {
      // eslint-disable-next-line no-alert
      alert('준비중인 서비스입니다.');
    } else {
      if (status !== AUTH_STRING) {
        signIn();
      } else {
        window.location.href = target.href;
      }
    }
  };

  return (
    <div className={cx('service')}>
      <div className={cx('service__card_wrapper')}>
        <ServiceCard>
          <>
            <div className={cx('logo-container')}>
              <img
                src={DatascopeLogo}
                className={cx('logo-big')}
                alt='DataScopeLogo'
              />
            </div>
            <span className={cx('card-title')}>{t('product-datascope')}</span>
            <img
              src={DatascopeProduct}
              className={cx('product-datascope')}
              alt='DataScopeProduct'
            />
            <p className={cx('product-introduce')}>{t('summary-datascope')}</p>
            <a
              className={cx('product-more')}
              href='https://jonathan.acryl.ai/datascope'
              target='_blank'
              rel='noopener noreferrer'
            >
              {t('more')}
            </a>
            <ul className={cx('product-desc')}>
              <li>{t('datascope-desc1')}</li>
              <li>{t('datascope-desc2')}</li>
              <li>{t('datascope-desc3')}</li>
            </ul>
            {/*
            <a
              className={cx('product-btn', 'active')}
              href='https://datascope.acryl.ai'
              onClick={(e) => {
                handleServiceClick(e);
              }}
            >
              {t('service-available')}
            </a>
            */}
            <a
              className={cx('product-btn', 'deactive')}
              href='https://datascope.acryl.ai'
              onClick={(e) => {
                handleServiceClick(e);
              }}
            >
              {t('service-not')}
            </a>
          </>
        </ServiceCard>

        <ServiceCard>
          <>
            <div className={cx('logo-container')}>
              <div className={cx('small-logo-wrapper')}>
                <img
                  src={IntelligenceLogo}
                  className={cx('logo-small')}
                  alt='IntelligenceLogo'
                />
                <img
                  src={closeIcon}
                  className={cx('ico-close')}
                  alt='closeIcon'
                />
                <img
                  src={FlightbaseLogo}
                  className={cx('logo-small')}
                  alt='FlightBaseLogo'
                />
                <img
                  src={closeIcon}
                  className={cx('ico-close')}
                  alt='closeIcon'
                />
                <img
                  src={MarkerLogo}
                  className={cx('logo-small')}
                  alt='MarkerLogo'
                />
              </div>
            </div>
            <span className={cx('card-title')}>{t('product-platform')}</span>
            <span className={cx('card-sub-title')}>
              {t('platform-subtitle')}
            </span>

            <img
              src={PlatformProduct}
              className={cx('product-platform')}
              alt='PlatformProduct'
            />
            <p className={cx('product-introduce')}>{t('summary-platform')}</p>
            <a
              className={cx('product-more')}
              href='https://jonathan.acryl.ai/flightbase'
              target='_blank'
              rel='noopener noreferrer'
            >
              {t('more')}
            </a>
            <ul className={cx('product-desc')}>
              <li>{t('platform-desc1')}</li>
              <li>{t('platform-desc2')}</li>
              <li>{t('platform-desc3')}</li>
            </ul>
            <a
              className={cx('product-btn', 'active')}
              href='https://flightbase.acryl.ai'
              onClick={(e) => {
                handleServiceClick(e);
              }}
            >
              {t('service-available')}
            </a>
          </>
        </ServiceCard>

        <ServiceCard>
          <>
            <div className={cx('logo-container')}>
              <img src={BotsLogo} className={cx('logo-big')} alt='BotsLogo' />
            </div>
            <span className={cx('card-title')}>{t('product-bots')}</span>
            <img
              src={BotsProduct}
              className={cx('product-bots')}
              alt='BotsProduct'
            />
            <p className={cx('product-introduce')}>{t('summary-bots')}</p>
            <a
              className={cx('product-more')}
              href='https://jonathan.acryl.ai/bots'
              target='_blank'
              rel='noopener noreferrer'
            >
              {t('more')}
            </a>
            <ul className={cx('product-desc')}>
              <li>{t('bots-desc1')}</li>
              <li>{t('bots-desc2')}</li>
              <li>{t('bots-desc3')}</li>
            </ul>
            <a
              className={cx('product-btn', 'deactive')}
              href='https://nubot.acryl.ai'
              onClick={(e) => {
                handleServiceClick(e);
              }}
            >
              {t('service-not')}
            </a>
          </>
        </ServiceCard>
      </div>
    </div>
  );
}
export default Index;
