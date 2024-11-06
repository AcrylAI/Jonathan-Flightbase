// Components
import { Card, Sypo } from '@src/components/atoms';

// Colors
import { LIME602, MONO205 } from '@src/utils/color';

// Icons
import { enterIcon } from '@src/static/images';

import style from './StatusCard.module.scss';
// CSS Module
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  icon: string;
  isEnter: boolean;
  desc: string;
  data1: string;
  data2: string;
  onClickCard?: () => void;
};

function StatusCard({ icon, isEnter, desc, data1, data2, onClickCard }: Props) {
  const handleClickCard = () => {
    if (onClickCard !== undefined) onClickCard();
  };
  return (
    <Card
      customStyle={{
        position: 'relative',
      }}
      enterIcon={isEnter ? enterIcon : undefined}
      hoverable={isEnter}
    >
      <div
        className={cx('status-card-container', onClickCard && 'pointer')}
        onClick={handleClickCard}
      >
        <div className={cx('labeling-card-icon')}>
          <img src={icon} alt='icon' />
        </div>
        <div className={cx('labeling-card-status')}>
          <div className={cx('left')}>
            <Sypo type='P2' color={MONO205}>
              {desc}
            </Sypo>
            <Sypo type='H3'>{data1}</Sypo>
          </div>
          <div className={cx('right')}>
            <Sypo type='P1' color={LIME602}>
              {data2}
            </Sypo>
          </div>
        </div>
      </div>
    </Card>
  );
}

StatusCard.defaultProps = {
  onClickCard: undefined,
};

export default StatusCard;
