// Components
import settingImage from '@images/icon/ic-lock.svg';
import { StatusCard } from '@jonathan/ui-react';

// Utils
import { convertBinaryByte } from '@src/utils';

// CSS module
import style from './Card.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const Card = ({
  id,
  name,
  share,
  type,
  disabled,
  prevStorageModel,
  model,
  size,
  modelOptions,
  selectHandler,
  readOnly,
  idx,
  capacity,
  usage,
  allocateUsed,
  workspaceUsage,
  lock,
  t,
}) => {
  return (
    <li
      className={cx(
        'card',
        prevStorageModel[0]?.id === id || (model && model.id === id)
          ? 'selected'
          : '',
        disabled && 'disabled',
        (type === 'EDIT_WORKSPACE' ||
          prevStorageModel.length > 0 ||
          lock === 1) &&
          (prevStorageModel[0]?.id !== id || (model && model.id !== id)) &&
          'read-only',
      )}
      onClick={() => {
        if (!disabled && !readOnly && type !== 'EDIT_WORKSPACE') {
          selectHandler(modelOptions[idx]);
        }
      }}
    >
      <div className={cx('name-box', lock === 1 && 'lock')}>
        <div className={cx('storage-name')} title={name}>
          {name}
        </div>
        <div className={cx('icon')}>
          {lock === 1 && (
            <img
              src={settingImage}
              alt='lock'
              style={{
                width: '24px',
                height: '24px',
              }}
            />
          )}
        </div>
      </div>
      <div className={cx('distribution')}>
        <span className={cx('type')}>
          {t('storageDistributionType.modal.label')}
        </span>
        {
          <StatusCard
            text={share ? t('share.label') : t('allocate.label')}
            status={share ? 'yellow' : 'orange'}
            size='x-small'
            customStyle={{
              width: '31px',
            }}
            type='default'
          />
        }
      </div>
      <div className={cx('capacity')}>
        {t('storageCapacity.label')}
        <span className={cx('value')}>
          {convertBinaryByte(capacity === undefined ? 0 : capacity)}
        </span>
      </div>
      <div className={cx('usage')}>
        {t('storageRemaining.modal.label')}
        <span className={cx('value')}>
          {type === 'EDIT_WORKSPACE'
            ? share === 1
              ? convertBinaryByte(usage === undefined ? 0 : usage)
              : convertBinaryByte(size - allocateUsed)
            : share === 1
            ? convertBinaryByte(usage === undefined ? 0 : usage)
            : convertBinaryByte(size - allocateUsed)}
        </span>
      </div>
    </li>
  );
};

export default Card;
