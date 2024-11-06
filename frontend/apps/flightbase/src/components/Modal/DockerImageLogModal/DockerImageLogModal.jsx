// i18n
import { useTranslation } from 'react-i18next';

// Components
import ModalFrame from '../ModalFrame';
import { StatusCard } from '@jonathan/ui-react';

// Icon
import Ready from '@src/static/images/icon/ic-status-ready.svg';
import Failed from '@src/static/images/icon/ic-status-failed.svg';
import ProgressYellow from '@src/static/images/icon/ic-status-progress-yellow.svg';
import ProgressGray from '@src/static/images/icon/ic-status-progress-gray.svg';

// CSS module
import classNames from 'classnames/bind';
import style from './DockerImageLogModal.module.scss';
const cx = classNames.bind(style);

function DockerImageLogModal({ type, modalData, log, status }) {
  const { t } = useTranslation();
  const { name, submit } = modalData;

  const newSubmit = {
    text: 'confirm.label',
    func: () => {
      submit.func();
    },
  };

  const statusCardRender = () => {
    switch (status) {
      case 0:
        return (
          <StatusCard
            text={t('pending')}
            status='pending'
            size='medium'
            leftIcon={ProgressYellow}
            customStyle={{
              width: 'auto',
              fontSize: '12px',
            }}
            leftIconStyle={{
              marginRight: '5px',
            }}
            isProgressStatus={true}
          />
        );
      case 1:
        return (
          <StatusCard
            text={t('installing')}
            status='installing'
            size='medium'
            leftIcon={ProgressYellow}
            customStyle={{
              width: 'auto',
              marginRight: '10px',
              fontSize: '12px',
            }}
            leftIconStyle={{
              marginRight: '5px',
            }}
            isProgressStatus={true}
          />
        );
      case 2:
        return (
          <StatusCard
            text={t('ready')}
            status='ready'
            size='medium'
            leftIcon={Ready}
            customStyle={{
              width: 'auto',
              marginRight: '10px',
              fontSize: '12px',
            }}
            leftIconStyle={{
              marginRight: '5px',
            }}
            isProgressStatus={false}
          />
        );
      case 3:
        return (
          <StatusCard
            text={t('failed')}
            status='failed'
            size='medium'
            leftIcon={Failed}
            customStyle={{
              width: 'auto',
              marginRight: '10px',
              fontSize: '12px',
            }}
            leftIconStyle={{
              marginRight: '5px',
            }}
            isProgressStatus={false}
          />
        );
      case 4:
        return (
          <StatusCard
            text={t('deleting')}
            status='stop'
            size='medium'
            leftIcon={ProgressGray}
            customStyle={{
              width: 'auto',
              marginRight: '10px',
              fontSize: '12px',
            }}
            leftIconStyle={{
              marginRight: '5px',
            }}
            isProgressStatus={true}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <ModalFrame
      type={type}
      submit={newSubmit}
      validate={true}
      isResize={true}
      isMinimize={true}
      title={`${t('dockerImage.label')} ${name} ${t('installLog.label')}`}
    >
      <div className={cx('main')}>
        <div className={cx('header')}>
          <div className={cx('name')}>
            {statusCardRender()}
            {`${t('dockerImage.label')} ${name}`}
          </div>
        </div>
        <div className={cx('title')}>{t('installLog.label')}</div>
        <article className={cx('container')}>
          {log && log.length > 0
            ? log.map((data, idx) => {
                return (
                  <div key={idx} className={cx('contents')}>
                    {data}
                  </div>
                );
              })
            : ''}
        </article>
      </div>
    </ModalFrame>
  );
}
export default DockerImageLogModal;
