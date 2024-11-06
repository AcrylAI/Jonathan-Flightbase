import { useTranslation } from 'react-i18next';
import { Button, Selectbox } from '@jonathan/ui-react';
import TextInput from '@src/components/atoms/input/TextInput';

import classNames from 'classnames/bind';
import style from './UserTestContentRequestBox.module.scss';
const cx = classNames.bind(style);

const UserTestContentRequestBox = ({
  info,
  setApiUrl,
  apiUrl,
  runAnalysis,
  loading,
}) => {
  const { t } = useTranslation();
  const {
    api_method: apiMethod,
    input_type: inputType,
    data_input_form_list: inputFormList,
    api_address: apiAddress,
  } = info;

  return (
    <div className={cx('request-box')}>
      <div className={cx('label-box')}>
        <label>Request URL</label>
        <Button
          type='none-border'
          icon='/images/icon/ic-refresh.svg'
          iconAlign='left'
          size='small'
          customStyle={{ width: '30px', padding: '6px' }}
          onClick={() => setApiUrl(apiAddress)}
          title='Reset API URL'
        />
      </div>
      <div className={cx('one-line')}>
        <div className={cx('api-address-box')}>
          <Selectbox
            list={[
              { label: 'POST', value: 'POST' },
              { label: 'GET', value: 'GET' },
            ]}
            selectedItem={
              apiMethod
                ? {
                    label: apiMethod,
                    value: apiMethod,
                  }
                : undefined
            }
            customStyle={{
              selectboxForm: {
                width: '110px',
              },
              listForm: {
                width: '110px',
              },
            }}
            isReadOnly
          />
          <div className={cx('text-input')}>
            <TextInput
              value={apiUrl || ''}
              onChange={(e) => setApiUrl(e.target.value)}
              maxLength='200'
            />
          </div>
        </div>
        {!['llm-single', 'llm-multi'].includes(inputType) && (
          <div className={cx('send-box')}>
            <Button
              type='primary'
              size='medium'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                runAnalysis(info, apiUrl);
              }}
              loading={inputFormList && loading}
            >
              {t('startAnalysis.label')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTestContentRequestBox;
