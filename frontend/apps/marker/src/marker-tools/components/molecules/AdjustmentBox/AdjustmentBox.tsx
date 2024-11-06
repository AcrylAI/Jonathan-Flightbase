import { useState } from 'react';

import { Sypo } from '@src/components/atoms';

import styles from './Adjustment.module.scss';
import classNames from 'classnames/bind';

import { Slider } from '@tools/components/atoms';
import { CommonProps, EventProps } from '@tools/types/components';
import useT from "@src/hooks/Locale/useT";

const cx = classNames.bind(styles);

function AdjustmentBox() {
  const { t } = useT();
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const onClickReturn = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  return (
    <div className={cx('adjustmentbox-container')}>
      <div className={cx('adjustmentbox-header')}>
        <Sypo type='h4' weight='m'>
          {t(`page.annotation.adjustment`)}
        </Sypo>
        <ReturnIcon onClick={onClickReturn} />
      </div>
      <div className={cx('adjustment-slider-list')}>
        <div className={cx('adjustment-slider-item')}>
          <div className={cx('adjustment-label')}>
            <Sypo type='p1' weight='r'>
              {t(`component.adjustment.brightness`)}
            </Sypo>
          </div>
          <Slider state={brightness} setState={setBrightness} />
        </div>
        <div className={cx('adjustment-slider-item')}>
          <div className={cx('adjustment-label')}>
            <Sypo type='p1' weight='r'>
              {t(`component.adjustment.contrast`)}
            </Sypo>
          </div>
          <Slider state={contrast} setState={setContrast} />
        </div>
        <div className={cx('adjustment-slider-item')}>
          <div className={cx('adjustment-label')}>
            <Sypo type='p1' weight='r'>
              {t(`component.adjustment.saturation`)}
            </Sypo>
          </div>
          <Slider state={saturation} setState={setSaturation} />
        </div>
      </div>
    </div>
  );
}

export default AdjustmentBox;

function ReturnIcon({
  onClick,
  className,
}: Pick<CommonProps, 'className'> & Pick<EventProps, 'onClick'>) {
  return (
    <div className={className} onClick={onClick}>
      <svg
        width='16'
        height='16'
        viewBox='0 0 16 16'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g clipPath='url(#clip0_7939_48796)'>
          <path
            d='M4.9873 6.23145H1.9873V3.23145'
            stroke='#C8CCD4'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
          <path
            d='M4.1123 11.8875C4.88131 12.6571 5.86131 13.1814 6.92833 13.394C7.99535 13.6066 9.10145 13.4979 10.1067 13.0818C11.112 12.6656 11.9712 11.9607 12.5757 11.0561C13.1803 10.1515 13.503 9.08799 13.503 8C13.503 6.91201 13.1803 5.84847 12.5757 4.9439C11.9712 4.03933 11.112 3.33439 10.1067 2.91824C9.10145 2.50209 7.99535 2.39343 6.92833 2.60601C5.86131 2.81859 4.88131 3.34286 4.1123 4.1125L1.9873 6.23125'
            stroke='#C8CCD4'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </g>
        <defs>
          <clipPath id='clip0_7939_48796'>
            <rect width='16' height='16' fill='white' />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
