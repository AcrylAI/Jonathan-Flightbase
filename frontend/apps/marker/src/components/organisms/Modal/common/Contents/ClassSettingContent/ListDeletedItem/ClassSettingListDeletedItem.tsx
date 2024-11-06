import styles from './ClassSettingListDeletedItem.module.scss';
import classNames from 'classnames/bind';
import React from 'react';
import { Sypo } from '@src/components/atoms';
import Tooltip from '@src/components/atoms/Tooltip/Tooltip';
import useT from '@src/hooks/Locale/useT';

const cx = classNames.bind(styles);

type ClassSettingListDeletedItemProps = {
  name: string;
  type: 'class' | 'prop' | 'option';
  onClickCancel: (e: React.MouseEvent<HTMLDivElement>) => void;
  tooltipDesc?: string;
};
const ClassSettingListDeletedItem = ({
  name,
  type,
  tooltipDesc,
  onClickCancel,
}: ClassSettingListDeletedItemProps) => {
  const { t } = useT();
  const typeHandler = (): string => {
    let result = '';
    switch (type) {
      case 'class':
        result = `${t(`modal.newProject.class`)}`;
        break;
      case 'prop':
        result = `${t(`modal.newProject.property`)}`;
        break;
      case 'option':
        result = `${t(`modal.newProject.option`)}`;
        break;
      default:
        result = `${t(`modal.newProject.class`)}`;
    }
    return result;
  };
  const tooltipHandler = (): string => {
    let result = '';
    switch (type) {
      case 'class':
        result = `${t(`modal.newProject.class`)}`;
        break;
      case 'prop':
        result = `${t(`modal.newProject.property`)}`;
        break;
      case 'option':
        result = `${t(`modal.newProject.option`)}`;
        break;
      default:
        result = `${t(`modal.newProject.class`)}`;
    }
    return `${t(`modal.editClasses.deleteTooltip`, { data: result })}`;
  };
  return (
    <div className={cx('deleted-item-container')}>
      <div className={cx('left-side')}>
        <div className={cx('desc')}>
          <Sypo type='P1' weight='regular'>{`${typeHandler()}(${name})${t(
            `modal.editClasses.deleteAnnounce`,
          )}`}</Sypo>
        </div>
        <div className={cx('tooltip')}>
          <Tooltip desc={tooltipHandler()} direction='se' status='error' />
        </div>
      </div>
      <div className={cx('right-side')}>
        <div className={cx('cancel-btn')} onClick={onClickCancel}>
          <Sypo weight='regular' type='P1'>
            {t(`component.btn.cancel`)}
          </Sypo>
        </div>
      </div>
    </div>
  );
};

ClassSettingListDeletedItem.defaultProps = {
  tooltipDesc: '',
};

export default ClassSettingListDeletedItem;
