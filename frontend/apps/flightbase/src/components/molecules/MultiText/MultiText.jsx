// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button, InputText } from '@jonathan/ui-react';

// CSS module
import classNames from 'classnames/bind';
import style from './MultiText.module.scss';

const cx = classNames.bind(style);

function MultiText ({
  label,
  status = '',
  onChange,
  onAdd,
  name,
  onRemove,
  placeholder = '',
  error,
  readOnly,
  multiValues,
}) {
  const { t } = useTranslation();
  return (
    <div className={cx('fb', 'input', status, 'input-wrap')}>
      {label && <label className={cx('fb', 'label')}>{t(label)}</label>}
      {multiValues && (
        <div className={cx('item-list')}>
          {multiValues.map(({ val }, idx) => (
            <div key={idx} className={cx('fb', 'input', 'item')}>
              <div className={cx('input-wrap')}>
                <InputText
                  placeholder={placeholder}
                  onChange={(e) => {
                    onChange(e, idx);
                  }}
                  name={name}
                  value={val}
                  idx={idx}
                  readOnly={readOnly}
                />
              </div>
              <button
                className={cx('remove-btn')}
                onClick={() => {
                  onRemove(idx);
                }}
              ></button>
            </div>
          ))}
        </div>
      )}
      <Button
        type='secondary'
        size='medium'
        customStyle={{ marginTop: '10px' }}
        onClick={onAdd}
      >
        {t('add.label')}
      </Button>
      <span className={cx('error')}>{error && t(error)}</span>
    </div>
  );
}

export default MultiText;
