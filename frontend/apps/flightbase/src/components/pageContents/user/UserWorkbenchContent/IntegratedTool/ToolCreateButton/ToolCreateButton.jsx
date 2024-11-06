// i18n
import { useTranslation } from 'react-i18next';

// Type
import { TRAINING_TOOL_TYPE } from '@src/types';

// CSS Module
import classNames from 'classnames/bind';
import style from './ToolCreateButton.module.scss';

const cx = classNames.bind(style);

function ToolCreateButton({ type, openCreateToolsModal }) {
  const toolType = TRAINING_TOOL_TYPE[type]?.type;
  const toolName = TRAINING_TOOL_TYPE[type]?.label;
  const { t } = useTranslation();
  return (
    <div
      className={cx('duplicate-btn')}
      onClick={() => openCreateToolsModal(type)}
    >
      <div className={cx('icon')}>
        <img src={`/images/icon/ic-${toolType}.svg`} alt={`${toolType} icon`} />
      </div>
      <label className={cx('label')}>
        {t('createTool.label', { tool: toolName })}
      </label>
      <div className={cx('plus')}></div>
    </div>
  );
}

export default ToolCreateButton;
