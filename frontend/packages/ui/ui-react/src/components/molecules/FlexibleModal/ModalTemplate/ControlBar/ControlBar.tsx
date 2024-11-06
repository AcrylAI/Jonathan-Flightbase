import style from './ControlBar.module.scss';
import classnames from 'classnames/bind';

import minimizeIcon from '@src/static/images/icons/ic-minimize-modal.svg';
import shrinkIcon from '@src/static/images/icons/ic-default-size-modal.svg';
import fullSizeIcon from '@src/static/images/icons/ic-full-size-modal.svg';
import closeIcon from '@src/static/images/icons/ic-close-modal.svg';
import { useState } from 'react';

const cx = classnames.bind(style);

type ControlBarProps = {
  isFullScreen: boolean;
  onClickClose: () => void;
  onClickMinimize: () => void;
  onClickFullScreen: () => void;
  minimize: boolean;
  fullscreen: boolean;
};

type ButtonTooltipProps = {
  desc: string;
  visible: boolean;
};

const ButtonTooltip = ({ desc, visible }: ButtonTooltipProps) => {
  return (
    <div className={cx('tooltip-container', visible ? 'visible' : 'hidden')}>
      <div className={cx('desc')}>{desc}</div>
    </div>
  );
};

export default function ControlBar({
  minimize,
  fullscreen,
  isFullScreen,
  onClickClose,
  onClickMinimize,
  onClickFullScreen,
}: ControlBarProps) {
  /*
  onClick Function
  */
  const [miniTip, setMiniTip] = useState<boolean>(false);
  const [fullTip, setFullTip] = useState<boolean>(false);
  const [closeTip, setCloseTip] = useState<boolean>(false);

  const handleMinimize = () => onClickMinimize();
  const handleFullScreen = () => onClickFullScreen();
  const handleClose = () => onClickClose();

  return (
    <div className={cx('bar-container')}>
      <div className={cx('left-side')}></div>
      <div className={cx('right-side')}>
        {minimize && (
          <div
            className={cx('minimize')}
            onMouseEnter={() => setMiniTip(true)}
            onMouseLeave={() => setMiniTip(false)}
            onClick={() => handleMinimize()}
          >
            <div className={cx('icon')}>
              <img src={minimizeIcon} alt='최소화' />
            </div>
            <ButtonTooltip desc='화면 최소화' visible={miniTip} />
          </div>
        )}
        {fullscreen && (
          <div
            className={cx('full-size')}
            onClick={() => handleFullScreen()}
            onMouseEnter={() => setFullTip(true)}
            onMouseLeave={() => setFullTip(false)}
          >
            <div className={cx('icon')}>
              <img
                src={isFullScreen ? shrinkIcon : fullSizeIcon}
                alt='최대화'
              />
            </div>
            <ButtonTooltip desc='전체 화면으로 보기' visible={fullTip} />
          </div>
        )}
        <div
          className={cx('close')}
          onClick={() => {
            handleClose();
          }}
          onMouseEnter={() => setCloseTip(true)}
          onMouseLeave={() => setCloseTip(false)}
        >
          <div className={cx('icon')}>
            <img src={closeIcon} alt='닫기' />
          </div>
          <ButtonTooltip desc='닫기 (ESC)' visible={closeTip} />
        </div>
      </div>
    </div>
  );
}
