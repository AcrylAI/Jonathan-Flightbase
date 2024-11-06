import { useSelector, useDispatch } from 'react-redux';

// ui-react
import { Button, InputText } from '@jonathan/ui-react';

// i18n
import { useTranslation } from 'react-i18next';

// Store
import { closeModal } from '@src/store/modules/modal';

// Icons
import closeIcon from '@images/icon/ic-close.svg';

// CSS Module
import classNames from 'classnames/bind';
import style from './EditClientNameModalContents.module.scss';
const cx = classNames.bind(style);

function EditClientNameModalContents({
  inputedLen,
  value,
  type,
  name,
  onChange,
  onClear,
  onSubmit,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { theme } = useSelector(({ theme }) => theme);

  return (
    <div className={cx('modal-wrapper')}>
      <div className={cx('header')}>
        <h2>{t('clients.modal.editName')}</h2>
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
        <div className={cx('limit')}>({inputedLen}/20)</div>
        <InputText
          theme={theme}
          value={value}
          onChange={onChange}
          options={{ maxLength: 20 }}
          disableLeftIcon={true}
          autoFocus={true}
          onClear={onClear}
        />
      </div>
      <div className={cx('footer')}>
        <Button
          theme={theme}
          onClick={() => {
            onSubmit(value);
          }}
          disabled={name === value}
        >
          {t('apply.label')}
        </Button>
      </div>
    </div>
  );
}

export default EditClientNameModalContents;
