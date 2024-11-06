import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 트리 구조를 표현하기 위한 아이콘
 */
function TreeStroke({
  size = 'sx',
  color = 'currentColor',
  fill = 'none',
  alt = 0
}: CommonIconProps) {
  const sx = useIconSizing(size);

  switch (alt) {
    case 1: return ( // ┬
      <div className={cx('IconBox')}>
        <svg width={sx||24} height={sx||24} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
          <line x1="12.5" y1="11" x2="12.5" y2="24" stroke={color}/>
          <line y1="11.5" x2="24" y2="11.5" stroke={color}/>
        </svg>
      </div>
    )
    case 2: return ( // ├
      <div className={cx('IconBox')}>
        <svg width={sx||24} height={sx||24} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
          <line x1="12.5" y1="11" x2="12.5" y2="24" stroke={color}/>
          <line x1="12" y1="11.5" x2="24" y2="11.5" stroke={color}/>
          <line x1="12.5" y1="11" x2="12.5" y2="2.18556e-08" stroke={color}/>
        </svg>
      </div>
    )
    case 3: return ( // └
      <div className={cx('IconBox')}>
        <svg width={sx||24} height={sx||24} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
          <line x1="12" y1="11.5" x2="24" y2="11.5" stroke={color}/>
          <line x1="12.5" y1="11" x2="12.5" y2="2.18556e-08" stroke={color}/>
        </svg>
      </div>
    )
    default: return (
      <div className={cx('IconBox')}>
        <svg width={sx||24} height={sx||24} fill={fill} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <line y1="11.5" x2="24" y2="11.5" stroke={color}/>
        </svg>
      </div>
    )
  }
}

export default TreeStroke;
