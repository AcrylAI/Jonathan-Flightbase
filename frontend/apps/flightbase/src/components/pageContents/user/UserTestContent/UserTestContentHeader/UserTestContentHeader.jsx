// CSS module
import { capitalizeFirstLetter } from '@src/utils';
import { useTranslation } from 'react-i18next';
import { convertLocalTime } from '@src/datetimeUtils';

import style from './UserTestContentHeader.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const UserTestContentHeader = ({ info }) => {
  const {
    type,
    name,
    description,
    built_in_model_name: builtInModelName,
    creator,
    date,
  } = info;
  const { t } = useTranslation();
  return (
    <div className={cx('info-box')}>
      <div className={cx('left')}>
        {type && (
          <div className={cx('type')}>
            {type !== 'example' && (
              <img
                className={cx('type-icon')}
                src={`/images/icon/00-ic-data-${type}-yellow.svg`}
                alt={type}
              />
            )}
            <span className={cx('type-label')}>
              {capitalizeFirstLetter(type) || '-'}
            </span>
          </div>
        )}
        <label className={cx('service-title')}>{name}</label>
        <div className={cx('service-description')}>
          {description
            ? description
                .trim()
                .split('\n')
                .map((line, index) => {
                  return (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  );
                })
            : '-'}
        </div>
        <div className={cx('meta')}>
          <label>{t('modelName.label')}</label>
          <span>{builtInModelName || '-'}</span>
        </div>
      </div>
      <div className={cx('right')}>
        <div className={cx('service-info')}>
          <div className={cx('meta')}>
            <label>{t('updatedAt.label')}</label>
            <span>{convertLocalTime(date)}</span>
          </div>
          <div className={cx('meta')}>
            <label>{t('creator.label')}</label>
            <span>{creator || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTestContentHeader;
