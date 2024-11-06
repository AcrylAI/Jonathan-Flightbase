import { useSelector, useDispatch } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Textarea, Button } from '@jonathan/ui-react';

// Icons
import closeIcon from '@images/icon/ic-close.svg';

// Store
import { closeModal } from '@src/store/modules/modal';

// CSS Module
import classNames from 'classnames/bind';
import style from './EditRoundMemoModalContents.module.scss';
const cx = classNames.bind(style);

function EditRoundMemoModalContents({
  version,
  memo,
  value,
  inputedLen,
  type,
  onChange,
  onSubmit,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { theme } = useSelector(({ theme }) => theme);

  return (
    <div className={cx('modal-wrapper')}>
      <div className={cx('header')}>
        <h2>
          {t('round.table.editMemo.label')}{' '}
          <span className={cx('model-version')}>
            ({t('round.version.label', { version })})
          </span>
        </h2>
        <img
          className={cx('close')}
          src={closeIcon}
          alt='close'
          onClick={() => {
            dispatch(closeModal(type));
          }}
        />
      </div>
      <div className={cx('contents')}>
        <div className={cx('limit')}>({inputedLen}/100)</div>
        <Textarea
          theme={theme}
          value={value}
          onChange={onChange}
          maxLength={100}
          autoFocus={true}
        />
      </div>
      <div className={cx('footer')}>
        <Button
          theme={theme}
          onClick={() => {
            onSubmit(value);
          }}
          disabled={memo === value}
        >
          {t('apply.label')}
        </Button>
      </div>
    </div>
  );
}

export default EditRoundMemoModalContents;
