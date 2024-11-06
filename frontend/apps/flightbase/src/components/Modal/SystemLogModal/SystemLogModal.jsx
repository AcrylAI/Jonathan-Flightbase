// Components
import { Button } from '@jonathan/ui-react';

// Icon
import download from '@src/static/images/icon/00-ic-data-download-white.svg';

// CSS Module
import classNames from 'classnames/bind';
import style from './SystemLogModal.module.scss';
const cx = classNames.bind(style);

function SystemLogModal({
  workerId,
  head,
  data,
  systemLogLoading,
  systemLogDown,
  downLoading,
  t,
}) {
  return (
    <div className={cx('wrapper')}>
      <h2 className={cx('title')}>
        {t('worker.label')} {workerId}
      </h2>
      <div className={cx('head-box')}>
        <div className={cx('head')}>{head}</div>
        <Button
          type='secondary'
          icon={download}
          iconAlign='right'
          onClick={() => systemLogDown(workerId)}
          loading={downLoading}
        >
          {t('download.label')}
        </Button>
      </div>
      <article className={cx('log-data-box')}>
        {!systemLogLoading ? data : ''}
      </article>
    </div>
  );
}

export default SystemLogModal;
