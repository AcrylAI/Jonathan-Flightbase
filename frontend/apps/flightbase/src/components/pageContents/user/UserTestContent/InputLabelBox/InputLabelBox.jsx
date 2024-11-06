// i18n
import { withTranslation } from 'react-i18next';

// Components
import { Badge, Tooltip } from '@jonathan/ui-react';

// CSS module
import style from './InputLabelBox.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

const InputLabelBox = ({ idx, type, apiKey, description, children, t }) => {
  return (
    <div className={cx('label-box')}>
      <label className={cx('label')}>
        <span className={cx('index')}>
          {`${t('inputData.label')} ${idx + 1} -`}
        </span>
        <span className={cx('type')}>
          <Badge label={type} type='blue' />
        </span>
        <span className={cx('key')}>API Key: {apiKey}</span>
        {description && <Tooltip contents={description} />}
      </label>
      {children}
    </div>
  );
};

export default withTranslation()(InputLabelBox);
