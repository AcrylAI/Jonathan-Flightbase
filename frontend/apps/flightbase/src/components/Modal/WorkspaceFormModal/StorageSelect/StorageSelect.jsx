import Card from './Card';

import { InputNumber, Tooltip } from '@jonathan/ui-react';
import StorageUsageBar from '../StorageUsageBar';

// CSS Module
import classNames from 'classnames/bind';
import style from './StorageSelect.module.scss';
const cx = classNames.bind(style);

function StorageSelect({
  list,
  type,
  prevStorageModel,
  storageSelectHandler,
  storageSelectedModel,
  storageInputValue,
  storageError = null,
  storageMessage,
  storageInputHandler,
  barData,
  editStorageAvailableSize,
  createStorageAvailableSize,
  workspaceUsage,
  t,
}) {
  const currentUsage = barData[1]?.usage;
  return (
    <div className={cx('container')}>
      <div className={cx('title')}>{t('storageAllocation.label')}</div>
      <div className={cx('sub-title')}>
        {t('selectStorageAllocation.label')}
      </div>
      <ul className={cx('card-list')}>
        {list?.map((m, key) => {
          return (
            <Card
              id={m.id}
              key={key}
              idx={key}
              type={type}
              share={m.share}
              model={storageSelectedModel} // 선택된 모델.
              name={m.logical_name}
              selectHandler={storageSelectHandler}
              modelOptions={list}
              capacity={m.size}
              prevStorageModel={prevStorageModel}
              usage={m.usage.avail}
              allocateUsed={m.usage.allocate_used}
              size={m.size}
              desc={m.description}
              lock={m.create_lock}
              barData={barData}
              workspaceUsage={workspaceUsage}
              t={t}
            />
          );
        })}
      </ul>
      <div className={cx('allocate')}>
        {(type === 'EDIT_WORKSPACE' && prevStorageModel[0]?.share === 0) ||
        storageSelectedModel?.share === 0 ? (
          <>
            <div className={cx('usage-title')}>
              {t('allocationCapacity.label')}
              <Tooltip
                contents={
                  <div>{t('storageAllocationUsage.tooltip.message')}</div>
                }
                iconCustomStyle={{
                  width: '20px',
                  marginLeft: '4px',
                  verticalAlign: 'text-top',
                }}
                contentsCustomStyle={{ minWidth: '340px', color: '#3e3e3e' }}
                contentsAlign={{ vertical: 'top', horizontal: 'left' }}
              />
            </div>
            <div className={cx('usage-tip')}>
              * {t('storageCapacityValid.message')}
            </div>

            <div className={cx('input-box')}>
              {type === 'EDIT_WORKSPACE' && (
                <div className={cx('current-usage-box')}>
                  <span className={cx('usage')}>{currentUsage}</span>
                  <span className={cx('plus')}>+</span>
                </div>
              )}
              <div className={cx('input')}>
                <InputNumber
                  placeholder={type === 'EDIT_WORKSPACE' ? 0 : 10}
                  name='gpuUsage'
                  value={storageInputValue || 0}
                  onChange={(e) =>
                    storageInputHandler(
                      e.value,
                      type === 'EDIT_WORKSPACE'
                        ? prevStorageModel[0]?.size
                        : storageSelectedModel.size,
                    )
                  }
                  customSize={{
                    width: '96px',
                    marginRight: '8px',
                    textAlign: 'right',
                  }}
                  status={
                    storageError === null
                      ? ''
                      : storageError === ''
                      ? 'success'
                      : 'error'
                  }
                  max={
                    type === 'EDIT_WORKSPACE'
                      ? editStorageAvailableSize
                      : createStorageAvailableSize
                  }
                  error={t(storageError)}
                  min={0}
                />
                <span className={cx('gb')}> GiB</span>
              </div>
              <div className={cx('total-usage-box')}>
                <span className={cx('equal')}>=</span>
                <span className={cx('usage')}>
                  {barData.length > 0 && type === 'EDIT_WORKSPACE'
                    ? (
                        Number(barData[1].usage.split(' ')[0]) +
                        storageInputValue * 0.984
                      ).toFixed(2)
                    : (storageInputValue * 0.984).toFixed(2)}{' '}
                  GiB
                </span>
                <label className={cx('label')}>
                  ({t('actualAllocationCapacity.label')})
                </label>
              </div>
            </div>
            <div className={cx('error', storageError === '' && 'valid')}>
              {storageError !== '' && t(storageMessage)}
            </div>
            <StorageUsageBar barData={barData} t={t} />
          </>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}

export default StorageSelect;
