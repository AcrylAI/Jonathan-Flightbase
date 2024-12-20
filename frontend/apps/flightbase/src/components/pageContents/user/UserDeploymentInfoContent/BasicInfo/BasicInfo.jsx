// i18n
import { useTranslation } from 'react-i18next';

// Utils
import { convertLocalTime } from '@src/datetimeUtils';

// CSS Module
import classNames from 'classnames/bind';
import style from './BasicInfo.module.scss';

const cx = classNames.bind(style);

function BasicInfo({ basicInfo, builtInModelInfo }) {
  const { t } = useTranslation();
  const {
    name,
    description,
    type,
    create_datetime: createDatetime,
  } = basicInfo;
  const {
    built_in_model_name: modelName,
    built_in_model_description: modelDesc,
  } = builtInModelInfo;
  return (
    <div className={cx('basic-info')}>
      <div className={cx('header')}>
        <span className={cx('title')}>
          {t('basicInformationSettings.title.label')}
        </span>
      </div>
      <div className={cx('content')}>
        <div className={cx('item')}>
          <div className={cx('label')}>{t('deploymentName.label')}</div>
          <div className={cx('value')}>{name ?? '-'}</div>
        </div>
        <div className={cx('item')}>
          <div className={cx('label')}>{t('deploymentDescription.label')}</div>
          <div className={cx('value')}>{description && description !== '' ? description : '-'}</div>
        </div>
        <div className={cx('item')}>
          <div className={cx('label')}>{t('deploymentType.label')}</div>
          <div className={cx('value')}>{type ?? '-'}</div>
        </div>
        {type === 'built-in' && (
          <div className={cx('item', 'model')}>
            <div className={cx('label')}>{t('builtInModel.label')}</div>
            <div className={cx('value')}>
              {modelName ?? (
                <div className={cx('deleted')}>
                  <img
                    src='/images/icon/ic-warning-red.svg'
                    alt='Deleted Model'
                  />
                  <span>{t('deploymentModelDeleted.message')}</span>
                </div>
              )}
              {modelDesc && <p className={cx('desc')}>{modelDesc}</p>}
            </div>
          </div>
        )}
        <div className={cx('item')}>
          <div className={cx('label')}>{t('createdDatetime.label')}</div>
          <div className={cx('value')}>
            {createDatetime ? convertLocalTime(createDatetime) : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BasicInfo;
