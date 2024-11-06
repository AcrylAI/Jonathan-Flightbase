// i18n
import { useTranslation } from 'react-i18next';

// Components
import ToolCard from './ToolCard';
import ToolCreateButton from './ToolCreateButton';

// CSS Module
import classNames from 'classnames/bind';
import style from './IntegratedTool.module.scss';
const cx = classNames.bind(style);

const IS_RSTUDIO = import.meta.env.VITE_REACT_APP_IS_TOOL_RSTUDIO === 'true';
const IS_FILEBROWSER =
  import.meta.env.VITE_REACT_APP_IS_TOOL_FILEBROWSER === 'true';

function IntegratedTool({
  toolList,
  trainingType,
  deleteHandler,
  isHideExplanation,
  openCreateToolsModal,
  isPermission,
}) {
  const { t } = useTranslation();
  return (
    <div className={cx('integrated-tool-box')}>
      <h2 className={cx('tool-title')}>{t('integratedTool.label')}</h2>
      {trainingType && trainingType !== 'built-in' && (
        <div className={cx('add-btn-box')}>
          <ToolCreateButton
            type={1}
            openCreateToolsModal={openCreateToolsModal}
          />
          <ToolCreateButton
            type={4}
            openCreateToolsModal={openCreateToolsModal}
          />
          {IS_RSTUDIO && (
            <ToolCreateButton
              type={5}
              openCreateToolsModal={openCreateToolsModal}
            />
          )}
          {IS_FILEBROWSER && (
            <ToolCreateButton
              type={6}
              openCreateToolsModal={openCreateToolsModal}
            />
          )}
        </div>
      )}
      <div className={cx('tool-list')}>
        {toolList.map((data) => (
          <ToolCard
            key={data.training_tool_id}
            {...data}
            deleteHandler={() => deleteHandler(data.training_tool_id)}
            toolReplicaNum={data.tool_replica_number}
            isHideExplanation={isHideExplanation}
            isPermission={isPermission}
          />
        ))}
      </div>
    </div>
  );
}

export default IntegratedTool;
