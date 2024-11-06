// Icon
import upArrow from '@src/static/images/icons/00-ic-basic-arrow-04-up.svg';
import downArrow from '@src/static/images/icons/00-ic-basic-arrow-04-down.svg';

import classNames from 'classnames/bind';
import style from './SortIcon.module.scss';
const cx = classNames.bind(style);

type Props = {
  onClick?: () => void;
};

function SortIcon({ onClick }: Props) {
  return (
    <div className={cx('sort-icon')} onClick={onClick}>
      <img src={upArrow} alt='up' />
      <img src={downArrow} alt='down' />
    </div>
  );
}

SortIcon.defaultProps = {
  onClick: undefined,
};

export default SortIcon;
