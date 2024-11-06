import { BLUE108 } from "@src/utils/color";
import { CommonIconProps } from '@src/werkzeug/defs/components';
import useIconSizing from '@src/werkzeug/hooks/common/useIconSizing';

import classNames from 'classnames/bind';
import styles from './Icon.module.scss';
const cx = classNames.bind(styles);

/**
 * 뒤로가기 아이콘
 */
function FileInProgressIcon({
  size = 'sx',
  color = BLUE108,
  fill = 'none',
}: CommonIconProps) {
  const sx = useIconSizing(size);

  return (
    <div className={cx('IconBox')}>
      <svg width={ sx || 16 } height={ sx || 16 } viewBox="0 0 16 16" fill={ fill } xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5295 8.00012C15.5295 12.1585 12.1585 15.5295 8.00012 15.5295C3.84174 15.5295 0.470703 12.1585 0.470703 8.00012C0.470703 3.84174 3.84174 0.470703 8.00012 0.470703C12.1585 0.470703 15.5295 3.84174 15.5295 8.00012Z" fill="white"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M8 0.941176C4.10152 0.941176 0.941176 4.10152 0.941176 8C0.941176 11.8985 4.10152 15.0588 8 15.0588C11.8985 15.0588 15.0588 11.8985 15.0588 8C15.0588 4.10152 11.8985 0.941176 8 0.941176ZM0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z" fill={ color }/>
        <path d="M8.04014 3.3714C8.04014 3.1587 8.21121 2.98472 8.4213 3.00107C9.15036 3.05779 9.85965 3.27671 10.4975 3.644C11.2462 4.07505 11.8706 4.69558 12.3093 5.44442C12.748 6.19327 12.9859 7.04459 12.9994 7.91448C13.0129 8.78438 12.8017 9.64282 12.3865 10.4052C11.9713 11.1676 11.3665 11.8076 10.6317 12.2622C9.89683 12.7168 9.05734 12.9702 8.19593 12.9975C7.33452 13.0249 6.48093 12.8251 5.71927 12.418C5.07026 12.0711 4.5071 11.5839 4.06901 10.9929C3.94276 10.8226 3.99661 10.5836 4.17452 10.4696L7.86304 8.10658C7.97332 8.03593 8.04014 7.91325 8.04014 7.7814L8.04014 3.3714Z" fill={ color }/>
      </svg>
    </div>
  );
}

export default FileInProgressIcon;
