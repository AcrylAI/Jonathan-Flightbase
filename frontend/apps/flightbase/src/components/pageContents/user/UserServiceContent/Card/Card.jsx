// i18n
import { useTranslation } from 'react-i18next';

// Components
import Status from '@src/components/atoms/Status';

// Utils
import { capitalizeFirstLetter } from '@src/utils';
import { convertLocalTime } from '@src/datetimeUtils';

// CSS module
import style from './Card.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function Card({ data, openTest, wid }) {
  const { t } = useTranslation();
  const {
    status: { status },
    type,
    name,
    create_datetime: date,
    creator,
    description,
    built_in_model_name: modelName,
    input_type: inputType,
  } = data;
  return (
    <div
      className={cx('card', status)}
      onClick={() => {
        sessionStorage.setItem(`services/${wid}_scroll_pos`, window.scrollY);
        if (status === 'running' || status === 'active') {
          openTest(data);
        }
      }}
    >
      <div className={cx('contents-box')}>
        <div className={cx('header')}>
          <div className={cx('type-status')}>
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
            <Status
              status={
                status === 'running' || status === 'active'
                  ? 'serviceActive'
                  : status
              }
              size='small'
            />
          </div>
          <div className={cx('service-name')} title={name}>
            {name}
          </div>
          <div className={cx('created-box')}>
            <span className={cx('created')}>{convertLocalTime(date)}</span>
            <span className={cx('creator')} title={creator}>
              {creator}
            </span>
          </div>
        </div>
        <div className={cx('body')}>
          <div className={cx('description-box')}>
            <div className={cx('description')} title={description}>
              {description.length > 0
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
          </div>
          <ul className={cx('detail-info')}>
            <li>
              <label className={cx('label')}>{t('modelName.label')}</label>
              <span className={cx('value')} title={modelName}>
                {modelName || '-'}
              </span>
            </li>
            <li>
              <label className={cx('label')}>{t('dataInputType.label')}</label>
              <span className={cx('value')} title={inputType}>
                {inputType ? inputType.split(',').join(', ') : '-'}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Card;
