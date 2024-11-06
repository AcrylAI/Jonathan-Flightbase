// i18n
import { useTranslation } from 'react-i18next';

// Components
import InputBoxWithLabel from '@src/components/molecules/InputBoxWithLabel';
import { InputText, Textarea, Button, Tooltip } from '@jonathan/ui-react';
import Radio from '@src/components/atoms/input/Radio';

// CSS module
import classNames from 'classnames/bind';
import style from './DeploymentInputValueBox.module.scss';
const cx = classNames.bind(style);

const methodOptions = [
  { label: 'GET', value: 'GET', disabled: true },
  { label: 'POST', value: 'POST', disabled: false },
];

const locationOptions = [
  {
    label: 'body=json',
    value: 'body',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
      width: 'calc(25% - 24px)',
    },
  },
  {
    label: 'args',
    value: 'args',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
      width: 'calc(25% - 24px)',
    },
  },
  {
    label: 'file',
    value: 'file',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
      width: 'calc(25% - 24px)',
    },
  },
  {
    label: 'form',
    value: 'form',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
      width: 'calc(25% - 24px)',
    },
  },
];

const categoryOptions = [
  {
    label: 'text',
    value: 'text',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
      width: 'calc(25% - 24px)',
      marginBottom: '12px',
    },
  },
  {
    label: 'image',
    value: 'image',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
      width: 'calc(25% - 24px)',
      marginBottom: '12px',
    },
  },
  {
    label: 'audio',
    value: 'audio',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
      width: 'calc(25% - 24px)',
      marginBottom: '12px',
    },
  },
  {
    label: 'video',
    value: 'video',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
      width: 'calc(25% - 24px)',
      marginBottom: '12px',
    },
  },
  {
    label: 'canvas-image (for bounding box)',
    value: 'canvas-image',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
      width: 'calc(50% - 12px)',
      marginRight: '12px',
      marginBottom: '12px',
    },
  },
  {
    label: 'canvas-coordinate',
    value: 'canvas-coordinate',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
      width: 'calc(50% - 12px)',
      marginRight: '12px',
      marginBottom: '12px',
    },
  },
  {
    label: 'csv (file)',
    value: 'csv',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
    },
  },
  {
    label: 'LLM',
    value: 'llm',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
    },
  },
];

const talkTypeOptions = [
  {
    label: 'Multi-turn',
    value: 'llm-multi',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
    },
  },
  {
    label: 'Single-turn',
    value: 'llm-single',
    disabled: false,
    labelStyle: {
      display: 'inline-block',
    },
  },
];

function DeploymentInputValueBox({
  deploymentInputForm,
  deploymentInputFormError,
  /** 이벤트 핸들러 */
  addInputForm,
  removeInputForm,
  inputHandler, // 입력 이벤트 핸들러
}) {
  const { t } = useTranslation();
  const { category } = deploymentInputForm[0];

  return (
    <div className={cx('wrapper')}>
      <div className={cx('input-list')}>
        {deploymentInputForm.map(
          (
            {
              method,
              location,
              apiKey,
              valueType,
              category,
              categoryDesc,
              talkType,
            },
            idx,
          ) => {
            return (
              <div key={idx} className={cx('input-item')}>
                <div className={cx('float-box')}>
                  <div className={cx('text-wrap')}>
                    <InputBoxWithLabel
                      labelText='Method'
                      labelSize='medium'
                      disableErrorMsg
                    >
                      <Radio
                        name={`method${idx}`}
                        options={methodOptions}
                        value={method}
                        onChange={(e) => inputHandler(e, idx)}
                      />
                    </InputBoxWithLabel>
                  </div>
                  <button
                    className={cx(
                      'remove-btn',
                      deploymentInputForm.length === 1 && 'disabled',
                    )}
                    onClick={() => {
                      if (deploymentInputForm.length !== 1) {
                        removeInputForm(idx);
                      }
                    }}
                  ></button>
                </div>
                <InputBoxWithLabel
                  labelText={t('category.label')}
                  labelSize='medium'
                  disableErrorMsg
                >
                  <Radio
                    name={`category${idx}`}
                    options={categoryOptions}
                    value={category}
                    onChange={(e) => inputHandler(e, idx)}
                    customStyle={{ marginBottom: '36px' }}
                  />
                </InputBoxWithLabel>
                {category === 'llm' && (
                  <InputBoxWithLabel
                    labelRight={
                      <Tooltip
                        contents={t('deploymentOutputTypes.tooltip.message')}
                        contentsCustomStyle={{
                          fontFamily: 'SpoqaM',
                        }}
                      />
                    }
                    labelText='대화 형식'
                    disableErrorMsg
                  >
                    <Radio
                      name={'talkType'}
                      options={talkTypeOptions}
                      value={talkType}
                      onChange={(e) => inputHandler(e, idx)}
                      customStyle={{ marginBottom: '36px' }}
                    />
                  </InputBoxWithLabel>
                )}
                <InputBoxWithLabel
                  labelText={t('categoryDescription.label')}
                  optionalText={t('optional.label')}
                  disableErrorMsg
                >
                  <Textarea
                    name='categoryDesc'
                    placeholder={t('categoryDescription.placeholder')}
                    value={categoryDesc}
                    onChange={(e) => inputHandler(e, idx)}
                    maxLength={1000}
                    isShowMaxLength
                    customStyle={{ marginBottom: '36px' }}
                  />
                </InputBoxWithLabel>
                <InputBoxWithLabel
                  labelText='Location'
                  labelSize='medium'
                  disableErrorMsg
                >
                  <Radio
                    name={`location${idx}`}
                    options={locationOptions}
                    value={location}
                    onChange={(e) => inputHandler(e, idx)}
                    readOnly
                    customStyle={{ marginBottom: '36px' }}
                  />
                </InputBoxWithLabel>
                <InputBoxWithLabel labelText='API Key' disableErrorMsg>
                  <InputText
                    size='medium'
                    name='apiKey'
                    value={apiKey}
                    onChange={(e) => inputHandler(e, idx)}
                    disableLeftIcon
                    disableClearBtn
                    customStyle={{ marginBottom: '36px' }}
                    isReadOnly={category === 'llm'}
                  />
                </InputBoxWithLabel>
                <InputBoxWithLabel
                  labelText={t('valueType.label')}
                  disableErrorMsg
                >
                  <InputText
                    size='medium'
                    name='valueType'
                    placeholder='ex) list, str, int, float etc...'
                    value={valueType}
                    onChange={(e) => inputHandler(e, idx)}
                    disableLeftIcon
                    disableClearBtn
                    isReadOnly={category === 'llm'}
                  />
                </InputBoxWithLabel>
              </div>
            );
          },
        )}
      </div>
      <div className={cx('btn-wrap')}>
        {category !== 'llm' && (
          <Button type='secondary' onClick={addInputForm}>
            {t('add.label')}
          </Button>
        )}
        <div className={cx('message')}>
          <span className={cx('error')}>{t(deploymentInputFormError)}</span>
        </div>
      </div>
    </div>
  );
}

export default DeploymentInputValueBox;
