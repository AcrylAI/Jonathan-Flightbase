import { Sypo } from '@src/components/atoms';

import { BLUE104, LIME603, MONO204, YELLOW303 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import styles from './MemberPageContents.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

type Props = {
  setMemberType: React.Dispatch<React.SetStateAction<string | undefined>>;
  memberType: string | undefined;
  onClickType: () => void;
};
function MemberTypeToolTip(props: Props) {
  const { t } = useT();
  const { setMemberType, memberType, onClickType } = props;
  const onClickHandler = (str: string) => {
    setMemberType(str);
    onClickType();
  };
  return (
    <div
      className={cx(
        'toolTipContainer',
        memberType === 'manager' && 'managerActive',
        memberType === 'labeler' && 'labelerActive',
        memberType === 'fbuser' && 'fbActive',
      )}
    >
      <div className={cx('overAllSection')} onClick={() => onClickHandler('')}>
        <div className={cx('overAllText')}>
          <Sypo weight='medium' color={MONO204} type='P2'>
            {t(`component.radiobtn.overall`)}
          </Sypo>
        </div>
      </div>
      <div
        className={cx('managerSection')}
        onClick={() => onClickHandler('manager')}
      >
        <div className={cx('wsManagerText')}>
          <Sypo weight='medium' color={LIME603} type='P2'>
            {t('component.badge.wsManager')}
          </Sypo>
        </div>
      </div>
      <div className={cx('fbSection')} onClick={() => onClickHandler('fbuser')}>
        <div className={cx('fbText')}>
          <Sypo weight='medium' color={BLUE104} type='P2'>
            {t('component.badge.fbUser')}
          </Sypo>
        </div>
      </div>
      <div
        className={cx('labelerSection')}
        onClick={() => onClickHandler('labeler')}
      >
        <div className={cx('labelerText')}>
          <Sypo weight='medium' color={YELLOW303} type='P2'>
            {t('component.badge.labeler')}
          </Sypo>
        </div>
      </div>
    </div>
  );
}

export default MemberTypeToolTip;
