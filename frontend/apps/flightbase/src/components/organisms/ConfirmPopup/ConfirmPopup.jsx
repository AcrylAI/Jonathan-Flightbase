import { Fragment, useEffect } from 'react';

// Components
import { Button } from '@jonathan/ui-react';

// Custom Hooks
import useDeleteConfirmMessage from '@src/hooks/useDeleteConfirmMessage';

// i18n
import { useTranslation } from 'react-i18next';

// CSS module
import style from './ConfirmPopup.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function ConfirmPopup({
  cancel,
  submit,
  title,
  content,
  notice,
  confirmMessage,
  close,
  testid,
}) {
  const { t } = useTranslation();
  const [deleteConfirmMessageState, renderDeleteConfirmMessage] =
    useDeleteConfirmMessage(notice, confirmMessage);

  useEffect(() => {
    const listener = (e) => {
      if (
        (deleteConfirmMessageState.isValid && e.key === 'Enter') ||
        e.key === 'NumpadEnter'
      ) {
        close();
        if (submit.func) {
          submit.func(e);
        }
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [close, deleteConfirmMessageState.isValid, submit]);

  return (
    <div className={cx('shadow')}>
      <div className={cx('popup')} data-testid={testid}>
        <div className={cx('popup-content')}>
          <h2 className={cx('title')}>{t(title)}</h2>
          <div className={cx('content')}>
            {t(content, { name: confirmMessage })
              .split('\n')
              .map((text, i) => (
                <Fragment key={i}>
                  {text} <br />
                </Fragment>
              ))}
            {confirmMessage && (
              <div className={cx('confirm-message-input')}>
                {renderDeleteConfirmMessage()}
              </div>
            )}
          </div>
        </div>
        <div className={cx('popup-footer')}>
          {cancel && (
            <Button
              type='none-border'
              size='medium'
              onClick={() => {
                close();
                if (cancel.func) {
                  cancel.func();
                }
              }}
              data-testid='confirm-modal-cancel-btn'
            >
              {t(cancel.text)}
            </Button>
          )}
          {submit && (
            <Button
              type='red'
              size='medium'
              onClick={(e) => {
                close();
                if (submit.func) {
                  submit.func(e);
                }
              }}
              data-testid='confirm-modal-submit-btn'
              disabled={!deleteConfirmMessageState.isValid}
            >
              {t(submit.text)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmPopup;
