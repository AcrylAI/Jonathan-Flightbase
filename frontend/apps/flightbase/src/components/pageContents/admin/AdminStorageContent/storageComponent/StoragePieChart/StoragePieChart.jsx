import { useTranslation } from 'react-i18next';

// Components
import PieChart from '@src/components/molecules/chart/PieChart2';
import { Tooltip } from '@jonathan/ui-react';

// CSS Module
import classNames from 'classnames/bind';
import style from './StoragePieChart.module.scss';

const cx = classNames.bind(style);

function StoragePieChart({
  label,
  value,
  total,
  title,
  titleStyle,
  used,
  pcent,
  totalSize,
  fontSize,
  additionalData = [],
}) {
  const { t } = useTranslation();
  // const [pieChartData, setPieChartData] = useState([
  //   { label, value, color: '#2d76f8' },
  // ]);

  // useEffect(() => {
  //   if (!mountRef.current) {
  //     if (additionalData.length > 0) {
  //       setPieChartData([...additionalData]);
  //     }
  //   }
  //   return () => (mountRef.current = true);
  // }, [
  //   label,
  //   value,
  //   total,
  //   title,
  //   titleStyle,
  //   used,
  //   pcent,
  //   totalSize,
  //   additionalData,
  // ]);

  const tooltip = (
    <div className={cx('tooltip')}>
      {t('followingSize.message')}
      <div className={cx('content')}>
        <span className={cx('bullet')}>{t('nonJonathanUsage.label')}</span>
        <span className={cx('size')}>
          {additionalData.length > 0 ? additionalData[0]?.size : '0.00GiB'}
        </span>
      </div>
    </div>
  );

  return (
    <div
      className={cx(
        'node-pie-chart',
        additionalData.length > 0 && 'allocate-chart',
      )}
    >
      <p className={cx('title')} style={titleStyle}>
        {title}
      </p>
      <PieChart
        width={'130px'}
        height={'130px'}
        data={
          additionalData.length > 0
            ? [...additionalData]
            : [{ label, value, color: '#2d76f8' }]
        }
        pcent={pcent}
        total={total}
      />

      {additionalData.length > 0 ? (
        // <div className={cx('legend-allocate')}>
        //   <div className={cx('used')}>
        //     <div className={cx('size')}>
        //       {additionalData[2]?.size}
        //       {' / ' + additionalData[1]?.size}
        //     </div>
        //     <div className={cx('bullet')}>사용중</div>
        //     {' / '}
        //     <div className={cx('bullet-allocate')}>할당됨</div>
        //   </div>
        //   <div className={cx('line')}></div>
        //   <div
        //     className={cx('total')}
        //     style={{ paddingRight: '0px', paddingLeft: '10px' }}
        //   >
        //     <span className={cx('val')} style={fontSize}>
        //       {total}
        //     </span>
        //     <span className={cx('label')}>{t('total.label')}</span>
        //   </div>
        // </div>
        <div className={cx('test')} style={{ fontSize: '5px' }}>
          <div className={cx('left-item')}>
            <span className={cx('val')} style={fontSize}>
              {additionalData[2]?.size}
              {' / ' + additionalData[1]?.size}
            </span>
            <span className={cx('label')}>
              <div className={cx('bullet')}>{t('active')}</div>
              {' / '}
              <div className={cx('bullet-allocate')}>
                {t('allocated.label')}
              </div>
            </span>
          </div>
          <div className={cx('line')}></div>
          <div
            className={cx('item')}
            style={{ paddingRight: '0px', paddingLeft: '10px' }}
          >
            <span className={cx('val')} style={fontSize}>
              {totalSize}
              <Tooltip
                contents={tooltip}
                contentsAlign={{ vertical: 'top', horizontal: 'left' }}
                iconCustomStyle={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '20px',
                }}
              />
            </span>
            <span className={cx('label')}>{t('total.label')}</span>
          </div>
        </div>
      ) : (
        label && (
          <div className={cx('legend')} style={{ fontSize: '5px' }}>
            <div className={cx('item')}>
              <span className={cx('val')} style={fontSize}>
                {used}
              </span>
              <span className={cx('label')}>
                <span className={cx('bullet')}>{label}</span>
              </span>
            </div>
            <div className={cx('line')}></div>
            <div
              className={cx('item')}
              style={{ paddingRight: '0px', paddingLeft: '10px' }}
            >
              <span className={cx('val')} style={fontSize}>
                {totalSize}
              </span>
              <span className={cx('label')}>{t('total.label')}</span>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default StoragePieChart;
