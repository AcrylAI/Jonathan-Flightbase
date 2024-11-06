// Components
import DeployLineChart from '@src/components/molecules/DeployChart/DeployLineChart';

// CSS Module
import className from 'classnames/bind';
import style from './ResourceGraph.module.scss';
const cx = className.bind(style);

function ResourceGraph({ memGraphData, cpuGraphData, gpuGraphData, t }) {
  return (
    <>
      <div className={cx('ram-cpu-chart')}>
        <div className={cx('chart')}>
          <div className={cx('label')}>
            <label>
              RAM : <span className={cx('value')}>{memGraphData.ram}</span>
            </label>
            <label>{t('last5m.label')}</label>
          </div>
          <div className={cx('chart-area')}>
            {memGraphData?.chartData?.[0].data.length > 0 && (
              <DeployLineChart
                data={memGraphData}
                height={240}
                enableGridX={false}
                enableGridY={true}
                enableTootlip='x'
                pointSize={5}
                filled={true}
              />
            )}
          </div>
        </div>
        <div className={cx('chart')}>
          <div className={cx('label')}>
            <label>
              CPU : <span className={cx('value')}>{cpuGraphData.cpuCores}</span>
            </label>
            <label>{t('last5m.label')}</label>
          </div>
          <div className={cx('chart-area')}>
            {cpuGraphData?.chartData?.[0].data.length > 0 && (
              <DeployLineChart
                data={cpuGraphData}
                height={240}
                enableGridX={false}
                enableGridY={true}
                enableTootlip='x'
                pointSize={5}
                filled={true}
              />
            )}
          </div>
        </div>
      </div>
      {gpuGraphData && gpuGraphData.length > 0 && (
        <div className={cx('gpu-chart')}>
          <ul>
            {gpuGraphData.map((gpu, idx) => {
              const {
                gpuGraph,
                memGraph,
                gpuUtil,
                totalMemory,
                usedMemory,
                usedMemoryRatio,
              } = gpu;
              return (
                <li key={idx}>
                  <label>GPU-{idx + 1}</label>
                  <div className={cx('chart-wrap')}>
                    <div className={cx('left')}>
                      <div className={cx('label')}>
                        <label>
                          Util : <span className={cx('value')}>{gpuUtil}%</span>
                        </label>
                        <label>{t('last5m.label')}</label>
                      </div>
                      <div className={cx('chart-area')}>
                        <DeployLineChart
                          data={gpuGraph}
                          height={120}
                          enableGridX={false}
                          enableGridY={false}
                          enableTootlip='x'
                          filled={true}
                          tooltipFontSize='small'
                        />
                      </div>
                    </div>
                    <div className={cx('right')}>
                      <div className={cx('label')}>
                        <label>
                          MEM :{' '}
                          <span className={cx('value')}>
                            {usedMemoryRatio} ({usedMemory} / {totalMemory} MiB)
                          </span>
                        </label>
                        <label>{t('last5m.label')}</label>
                      </div>
                      <div className={cx('chart-area')}>
                        <DeployLineChart
                          data={memGraph}
                          height={120}
                          enableGridX={false}
                          enableGridY={false}
                          enableTootlip='x'
                          filled={true}
                          tooltipFontSize='small'
                        />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}

export default ResourceGraph;
