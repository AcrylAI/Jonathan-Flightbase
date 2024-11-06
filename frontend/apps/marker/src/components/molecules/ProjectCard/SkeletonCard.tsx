import { CardBox } from '@src/components/atoms';

import styles from './ProjectCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const SkeletonCard = () => {
  return (
    <CardBox
      width='100%'
      height='342px'
      padding='20px 24px'
      borderRadius={10}
      backgroundColor='#FFFFFF'
      boxShadow='0px 3px 12px rgba(230, 234, 242, 0.6)'
    >
      <div className={cx('skeleton-card-inner')}>
        <div className={cx('icon-skeleton', 'skeleton')}></div>
        <div className={cx('title-skeleton', 'skeleton')}></div>
        <div className={cx('contents-skeleton', 'skeleton')}></div>
      </div>
    </CardBox>
  );
};

export default SkeletonCard;
