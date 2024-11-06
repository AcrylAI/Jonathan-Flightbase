import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// i18n
import { useTranslation } from 'react-i18next';

// CSS Module
import classNames from 'classnames/bind';
import style from './WorkerStatus.module.scss';
const cx = classNames.bind(style);

function WorkerStatus({ worker }) {
  const {
    status: workerStatus,
    configurations,
    count: workerCount,
    resource_usage: resourceUsage,
  } = worker;

  const { t } = useTranslation();
  const popup = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const popupHandler = () => {
    setIsOpen(!isOpen);
  };

  const handleClick = (e) => {
    // PopupMenu를 제외한 요소 클릭 시 popupHandler 이벤트 실행
    if (
      popup.current &&
      !ReactDOM.findDOMNode(popup.current).contains(e.target)
    ) {
      setIsOpen(false);
    }
  };

  // 클릭 이벤트 관련 라이프 사이클
  useEffect(() => {
    // PopupMenu 컴포넌트가 마운트 될 때 documemnt에 팝업 닫기 이벤트 추가
    document.addEventListener('click', handleClick, false);
    return () => {
      // 현재 컴포넌트가 언마운트 되면 handleClick 이벤트 제거
      document.removeEventListener('click', handleClick, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup]);

  return (
    <div className={cx('worker-status')} ref={popup}>
      <button
        className={cx(
          'btn',
          workerStatus.error > 0 ? 'error' : '',
          workerCount === 0 && 'readonly',
          isOpen && 'active',
        )}
        onClick={popupHandler}
      >
        {`${t('worker.label')}*${workerCount} (CPU*${resourceUsage.cpu}, GPU*${
          resourceUsage.gpu
        })`}
      </button>
      {isOpen && workerCount > 0 && (
        <div className={cx('popup')}>
          <div className={cx('status-box')}>
            <label className={cx('label')}>{t('worker.label')}</label>
            <div className={cx('status')}>
              {workerStatus.installing > 0 && (
                <span className={cx('badge', 'installing')}>
                  Installing {workerStatus.installing}
                </span>
              )}
              {workerStatus.running > 0 && (
                <span className={cx('badge', 'running')}>
                  Running {workerStatus.running}
                </span>
              )}
              {workerStatus.error > 0 && (
                <span className={cx('badge', 'error')}>
                  Error {workerStatus.error}
                </span>
              )}
            </div>
          </div>
          <div className={cx('configuration-box')}>
            <label className={cx('label')}>{t('configurations.label')}</label>
            <div className={cx('configurations')}>
              {configurations.map((v, i) => (
                <span key={i}>{v}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerStatus;
