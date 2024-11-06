// CSS Module
import classNames from 'classnames/bind';
import style from './StorageTemplate.module.scss';
const cx = classNames.bind(style);

const noop = () => 'Empty';

/**
 * 스토리지 페이지 템플릿 컴포넌트
 * @param {{
 *  pieChartRender: () => JSX.Element,
 *  header: JSX.Element,
 *  listRender: Object
 *  customStyle: Object
 * }} props
 */
function StorageTemplate({
  pieChartRender = noop,
  header,
  listRender = noop,
  customStyle,
}) {
  return (
    <div
      className={cx('storage-template', header && 'header')}
      style={{ customStyle }}
    >
      {header ? (
        <>
          <div className={cx('header-box')}>
            <div className={cx('header')}>{header && header}</div>
          </div>
          <div className={cx('table-container')}>
            <div className={cx('pie-chart-box')}>{pieChartRender}</div>
            <div className={cx('table-box')}>{listRender}</div>
          </div>
        </>
      ) : (
        <>
          <div className={cx('pie-chart-box')}>{pieChartRender}</div>
          <div className={cx('table-box')}>{listRender}</div>
        </>
      )}
    </div>
  );
}

export default StorageTemplate;
