import { useTranslation } from 'react-i18next';

// Components
import PieChart from '@src/components/molecules/chart/PieChart2';

// CSS Module
import classNames from 'classnames/bind';
import style from './NodePieChart.module.scss';
const cx = classNames.bind(style);

/**
 * 노드 페이지에서 사용되는 파이 차트 컴포넌트
 * @param {{
 *  label: number,
 *  value: number,
 *  total: number,
 *  title: string,
 * }} props
 *
 * @component
 * @example
 *
 *
 * const total = 10;
 * const value = 5;
 * const label = 'Allocated';
 * const title = 'Total GPU Allocation Status';
 *
 * return (
 *  <NodePieChart
 *     title={title}
 *     total={total}
 *     label={label}
 *     value={value}
 *  />
 * )
 */
function NodePieChart({ label, value, total, title }) {
  const { t } = useTranslation();

  return (
    <div className={cx('node-pie-chart')}>
      <p className={cx('title')}>{title}</p>
      <PieChart
        width='132px'
        height='132px'
        data={[{ label, value, color: '#2d76f8' }]}
        total={total}
      />
      <div className={cx('legend')}>
        <div className={cx('item')}>
          <span className={cx('val')}>{value}</span>
          <span className={cx('label')}>
            <span className={cx('bullet')}>{label}</span>
          </span>
        </div>
        <div className={cx('item')}>
          <span className={cx('val')}>{total}</span>
          <span className={cx('label')}>{t('total.label')}</span>
        </div>
      </div>
    </div>
  );
}

export default NodePieChart;
