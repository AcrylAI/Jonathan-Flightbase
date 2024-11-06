import { useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

// i18n
import { useTranslation } from 'react-i18next';

// ui-react
import { Tab } from '@jonathan/ui-react';

// Components
import Aggregation from './Aggregation';
import ClientTraining from './ClientTraining';
import ResultModel from './ResultModel';

// CSS module
import classNames from 'classnames/bind';
import style from './RoundDetailPageContents.module.scss';
const cx = classNames.bind(style);

/**
 * @returns
 */
function RoundDetailPageContents({
  clientTrainingData,
  aggregationData,
  resultModelData,
  roundInfo,
  getChartData,
  hpsChartData,
  getHpsLogData,
}) {
  const { theme } = useSelector(({ theme }) => theme);
  const { t } = useTranslation();
  const { id } = useParams();
  const history = useHistory();

  const [selectedPageIdx, setSelectedPageIdx] = useState(0);

  const tabHandler = (idx) => {
    setSelectedPageIdx(idx);
  };

  const pageCategory = useMemo(
    () => [
      {
        label: t('roundDetail.tab.clientTraining.label'),
        component: () => <ClientTraining data={clientTrainingData} />,
      },
      {
        label: t('roundDetail.tab.aggregation.label'),
        component: () => (
          <Aggregation
            data={aggregationData}
            theme={theme}
            roundInfo={roundInfo}
            getChartData={getChartData}
            hpsChartData={hpsChartData}
            getHpsLogData={getHpsLogData}
          />
        ),
      },
      {
        label: t('roundDetail.tab.resultModel.label'),
        component: () => <ResultModel data={resultModelData} />,
      },
    ],
    [
      t,
      clientTrainingData,
      aggregationData,
      theme,
      roundInfo,
      getChartData,
      hpsChartData,
      getHpsLogData,
      resultModelData,
    ],
  );

  return (
    <>
      <div
        className={cx('btn-contents')}
        onClick={() => {
          history.push('/rounds');
        }}
      >
        <div className={cx('arrow')}></div>
        <label>{t('round.version.label', { version: id })}</label>
      </div>
      <Tab
        theme={theme}
        selectedItem={selectedPageIdx}
        category={pageCategory}
        onClick={tabHandler}
        renderComponent={pageCategory[selectedPageIdx].component}
        customStyle={{
          tab: {
            width: '100%',
            marginTop: '12px',
          },
          selectBtnArea: {
            transform: 'translateY(12px)',
          },
          line: {
            display: 'none',
          },
          component: {
            paddingTop: '32px',
            transform: 'translateY(12px)',
          },
        }}
      />
    </>
  );
}

export default RoundDetailPageContents;
