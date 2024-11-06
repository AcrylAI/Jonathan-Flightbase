// Icons
import rightArrowActive from '@images/icon/ic-right-arrow-active.svg';
import rightArrowDisable from '@images/icon/ic-right-arrow-disable.svg';
import leftArrowActive from '@images/icon/ic-left-arrow-active.svg';
import leftArrowDisable from '@images/icon/ic-left-arrow-disable.svg';

// CSS Module
import classNames from 'classnames/bind';
import style from './Slider.module.scss';
const cx = classNames.bind(style);

function Slider({ names, children, onPressArrowHandler, stageId, currStatus }) {
  const pageLeftHandler = () => {
    if (stageId !== 0) {
      let newStatus = stageId - 1;
      onPressArrowHandler(newStatus);
    }
  };

  const pageRightHandler = () => {
    if (stageId !== names.length - 1) {
      let newStatus = stageId + 1;
      onPressArrowHandler(newStatus);
    }
  };

  return (
    <>
      <div className={cx('control-box')}>
        <div
          className={cx('icon-box', stageId === 0 && 'disable')}
          onClick={pageLeftHandler}
        >
          <img
            className={cx('arrow-icon')}
            src={stageId === 0 ? leftArrowDisable : leftArrowActive}
            alt='left arrow'
          />
        </div>
        <p className={cx('title')}>{names[stageId]}</p>
        <div
          className={cx('icon-box', stageId === names.length - 1 && 'disable')}
          onClick={pageRightHandler}
        >
          <img
            className={cx('arrow-icon')}
            src={
              stageId === names.length - 1
                ? rightArrowDisable
                : rightArrowActive
            }
            alt='right arrow'
            onClick={pageRightHandler}
          />
        </div>
      </div>
      <div className={cx('step-box')}>
        {names.map((data, index) => (
          <div key={data} className={cx('barloader-wrap')}>
            {stageId === index ? (
              <div className={cx('barloader-blue')}>
                <div className={cx('bar1')}></div>
                <div className={cx(index + 1 === currStatus && 'bar2')}></div>
              </div>
            ) : (
              <div className={cx('barloader-gray')}>
                <div className={cx('bar1')}></div>
                <div className={cx(index + 1 === currStatus && 'bar2')}></div>
              </div>
            )}
          </div>
        ))}
      </div>
      {children}
    </>
  );
}
export default Slider;
