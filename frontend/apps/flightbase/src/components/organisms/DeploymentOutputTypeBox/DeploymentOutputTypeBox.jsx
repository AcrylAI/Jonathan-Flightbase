// i18n
import { useTranslation } from 'react-i18next';

// Components
import { InputText, Tooltip } from '@jonathan/ui-react';
import InputBoxWithLabel from '@src/components/molecules/InputBoxWithLabel';
import CheckboxList from '@src/components/molecules/CheckboxList';

// CSS module
import classNames from 'classnames/bind';
import style from './DeploymentOutputTypeBox.module.scss';
const cx = classNames.bind(style);

function DeploymentOutputTypeBox({
  deploymentOutputTypes,
  otherDeploymentOutputTypes,
  otherDeploymentOutputTypesError,
  deploymentOutputTypesHandler,
  textInputHandler,
}) {
  const { t } = useTranslation();
  return (
    <div className={cx('wrapper')}>
      <div className={cx('row')}>
        <CheckboxList
          label='deploymentOutputTypes.label'
          options={deploymentOutputTypes}
          onChange={(_, idx) => deploymentOutputTypesHandler(idx)}
          customStyle={{
            display: 'flex',
            flexDirection: 'column',
          }}
          labelRight={
            <Tooltip
              contents={t('deploymentOutputTypes.tooltip.message')}
              contentsCustomStyle={{
                fontFamily: 'SpoqaM',
              }}
            />
          }
          disableErrorText
        />
      </div>
      <div className={cx('row')}>
        <InputBoxWithLabel errorMsg={t(otherDeploymentOutputTypesError)}>
          <InputText
            size='medium'
            placeholder={t('enterOther.placeholder')}
            name='otherDeploymentOutputTypes'
            value={otherDeploymentOutputTypes}
            onChange={textInputHandler}
            isDisabled={
              !deploymentOutputTypes[deploymentOutputTypes.length - 1].checked
            }
            disableLeftIcon
            disableClearBtn
          />
        </InputBoxWithLabel>
      </div>
    </div>
  );
}

export default DeploymentOutputTypeBox;
