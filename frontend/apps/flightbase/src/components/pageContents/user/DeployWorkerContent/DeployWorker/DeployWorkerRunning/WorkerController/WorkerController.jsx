import { Fragment } from 'react';

import { Button } from '@jonathan/ui-react';

import classNames from 'classnames/bind';
import style from './WorkerController.module.scss';
const cx = classNames.bind(style);

function WorkerController({
  workerSettingInfo,
  onEdit,
  addWorker,
  addLoading,
  t,
}) {
  const isObject = (content, value) => {
    if (typeof content === 'object') {
      if (value === 'gpu_model') {
        // value가 gpu_model일 경우 { key: value[] } 타입
        return Object.keys(content).map((gpuModel, idx) => (
          <li key={idx}>
            {gpuModel}
            {content[gpuModel].map((name, i) => (
              <Fragment key={i}>
                <br />
                <label> - {name}</label>
              </Fragment>
            ))}
          </li>
        ));
      }
      return Object.keys(content).map((name, idx) => (
        <li key={idx}>
          {name} : {content[name]}
        </li>
      ));
    }
    return <li>{content}</li>;
  };

  return (
    <div className={cx('new-worker-setting')}>
      <label className={cx('title')}>{t('deploymentWorker.newWorker')}</label>
      <ul className={cx('setting-wrap')}>
        {workerSettingInfo.map((info, idx) => {
          return (
            <li key={idx}>
              <div className={cx('label')}>{t(info.label)}</div>
              <div className={cx('content')}>
                {info.content ? (
                  <ul>{isObject(info.content, info.value ?? '')}</ul>
                ) : (
                  '-'
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className={cx('btn-wrap')}>
        <Button
          type='primary-reverse'
          icon='/images/icon/ic-edit-blue.svg'
          iconAlign='left'
          customStyle={{ border: '1px solid #2d76f8' }}
          onClick={onEdit}
        >
          {t('edit.label')}
        </Button>
        <Button
          type='primary'
          icon='/images/icon/00-ic-basic-plus-white.svg'
          iconAlign='left'
          loading={addLoading}
          onClick={() => {
            if (!addLoading) {
              addWorker();
            }
          }}
        >
          {t('deploymentWorker.addWorker')}
        </Button>
      </div>
    </div>
  );
}

export default WorkerController;
