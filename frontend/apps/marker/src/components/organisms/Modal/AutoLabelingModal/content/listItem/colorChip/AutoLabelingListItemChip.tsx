import styles from './AutoLabelingListItemChip.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  color: string;
  size?: 'sm' | 'md';
};
const AutoLabelingListItemChip = ({ size, color }: Props) => {
  return (
    <div
      style={{ backgroundColor: color }}
      className={cx('color-chip', size ?? 'md')}
    ></div>
  );
};

AutoLabelingListItemChip.defaultProps = {
  size: 'md',
};

export default AutoLabelingListItemChip;
