// i18n
import { useTranslation } from 'react-i18next';

// Components
import { Button } from '@jonathan/ui-react';
import PageTitle from '@src/components/atoms/PageTitle';
import QueueTool from './QueueTool';
import IntegratedTool from './IntegratedTool';
import CardLoading from './QueueTool/CardLoading';

// CSS Module
import classNames from 'classnames/bind';
import style from './UserWorkbenchContent.module.scss';

const cx = classNames.bind(style);

// 드론 챌린지 모드 여부
const IS_DNADRONECHALLENGE =
  import.meta.env.VITE_REACT_APP_SERVICE_LOGO === 'DNA+DRONE' &&
  import.meta.env.VITE_REACT_APP_IS_CHALLENGE === 'true';

function UserWorkbenchContent({
  trainingName,
  trainingType,
  queueToolList,
  integratedToolList,
  isHideExplanation,
  showAndHideExplanation,
  toolDeleteHandler,
  stopLoading,
  isActive,
  onStopAllTool,
  openCreateToolsModal,
  isPermission,
}) {
  const { t } = useTranslation();

  return (
    <div className={cx('content')}>
      <div className={cx('title-box')}>
        <PageTitle>{trainingName}</PageTitle>
        <div className={cx('btn-box')}>
          <Button
            type='gray'
            icon={`/images/icon/00-ic-info-eye${
              isHideExplanation ? '-off' : ''
            }.svg`}
            iconAlign='left'
            onClick={showAndHideExplanation}
          >
            {t('tips.label')}
          </Button>
          <Button
            type='red-light'
            icon='/images/icon/ic-stop-red.svg'
            iconAlign='left'
            disabled={!isActive}
            loading={stopLoading}
            onClick={onStopAllTool}
          >
            {t('stopAll.label')}
          </Button>
        </div>
      </div>
      {!IS_DNADRONECHALLENGE &&
        (queueToolList.length > 0 ? (
          <QueueTool
            toolList={queueToolList}
            isHideExplanation={isHideExplanation}
          />
        ) : (
          <>
            <h2 className={cx('tool-title')}>{t('queueTool.label')}</h2>
            <div className={cx('loading-list')}>
              {[{}, {}].map((_, key) => (
                <CardLoading key={key} />
              ))}
            </div>
          </>
        ))}
      <IntegratedTool
        toolList={integratedToolList}
        trainingType={trainingType}
        deleteHandler={toolDeleteHandler}
        isHideExplanation={isHideExplanation}
        openCreateToolsModal={openCreateToolsModal}
        isPermission={isPermission}
      />
    </div>
  );
}

export default UserWorkbenchContent;
