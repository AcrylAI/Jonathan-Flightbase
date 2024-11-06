import classNames from 'classnames/bind';
import styles from './IconBox.module.scss';
const cx = classNames.bind(styles);

type Props = {
  size?: string;
  color?: string;
  fill?: string;
}

/**
 * @icon
 * @author Dawson
 * @version 22-11-28
 */
function CloseIcon({
  size = '24px',
  color = 'currentColor',
  fill = 'none',
}: Props) {

  return (
    <div className={cx('IconBox')}>
      <svg width={ size } height={ size } viewBox="0 0 16 16" fill={ fill } xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 3.5L3.5 12.5" stroke={ color } strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.5 12.5L3.5 3.5" stroke={ color } strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export default CloseIcon;
