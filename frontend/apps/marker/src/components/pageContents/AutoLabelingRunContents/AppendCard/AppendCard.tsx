import { useRecoilValue } from 'recoil';

import { AutoLabelingRunPageAtom } from '@src/stores/components/pageContents/AutoLabelingRunPageAtom';

import { Sypo } from '@src/components/atoms';
import DonutChart from '../DonutChart/DonutChart';

import BarChart from '@src/components/molecules/charts/BarChart';

import { MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import style from './AppendCard.module.scss';
import classNames from 'classnames/bind';

import { Color } from '@amcharts/amcharts5';

const cx = classNames.bind(style);

type Props = {
  index: number;
  modelId: string;
  windowSize: {
    width: number;
  };
};

function AppendCard({ index, modelId, windowSize }: Props) {
  const { t } = useT();

  const autoLabelingRunPageAtom =
    useRecoilValue<AutoLabelingRunPageAtom.AutoLabelingRunPageAtomModel>(
      AutoLabelingRunPageAtom.autoLabelingRunPageAtom,
    );

  return (
    <div className={cx('chart-area')}>
      <div className={cx('donut-chart')}>
        <Sypo type='P1' color={MONO205}>
          {t(`page.runAutolabeling.labelsRatioByClass`)}
        </Sypo>
        {autoLabelingRunPageAtom.graph[modelId] &&
          autoLabelingRunPageAtom.graph[modelId].donut && (
            <div className={cx('chart')}>
              <DonutChart
                tagId={`auto-labeling-donut-${index}-${modelId}`}
                data={{
                  ...autoLabelingRunPageAtom.graph[modelId]?.donut,
                  totalDataLabel: t('page.runAutolabeling.totalLabels'),
                }}
                thickNess={1}
                legendVisible={false}
                customStyle={{
                  height: windowSize.width >= 932 ? '276px' : '400px',
                }}
                legendAlign={windowSize.width >= 932 ? 'right' : 'bottom'}
                seriesColors={autoLabelingRunPageAtom.graph[
                  modelId
                ]?.donut.data.map((data) => {
                  if (data.color) {
                    return data.color as unknown as Color;
                  }
                  return '#ffffff' as unknown as Color;
                })}
              />
              <div className={cx('legend-area')}>
                {autoLabelingRunPageAtom.graph[modelId].donut.data.map(
                  (data, index) => {
                    const d = Number(data.data);
                    const td = Number(
                      autoLabelingRunPageAtom.graph[modelId].donut.totalData,
                    );
                    const percent =
                      !Number.isNaN(d) && !Number.isNaN(td)
                        ? Math.floor((d / td) * 100)
                        : 0;
                    return (
                      <div className={cx('legend')} key={index}>
                        <div
                          className={cx('mark')}
                          style={{
                            backgroundColor: String(data.color ?? '#FFFFFF'),
                          }}
                        ></div>
                        <div className={cx('data-text')}>
                          <Sypo type='P2' weight='R'>
                            {data.className}
                          </Sypo>
                          <Sypo type='P2' weight='R'>
                            {percent}%
                          </Sypo>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}
      </div>
      <div className={cx('line-chart')}>
        <Sypo type='P1' color={MONO205}>
          {t(`page.runAutolabeling.labelsRatioByClass`)}
        </Sypo>
        {autoLabelingRunPageAtom.graph[modelId] &&
          autoLabelingRunPageAtom.graph[modelId].bar && (
            <BarChart
              tagId={`auto-labeling-bar-${index}-${modelId}`}
              data={autoLabelingRunPageAtom.graph[modelId]?.bar}
              customStyle={{
                height: windowSize.width >= 932 ? '276px' : '400px',
              }}
              min={0}
              chartHeight={windowSize.width >= 932 ? 226 : 310}
            />
          )}
      </div>
    </div>
  );
}

export default AppendCard;
