import styles from './ExportResultModalContent.module.scss';
import classNames from 'classnames/bind';
import ExportResultModalLeftSection from './LeftSection/ExportResultModalLeftSection';
import ExportResultModalRightSection from './RightSection/ExportResultModalRightSection';
import { CloseGrayIcon } from '@src/static/images';
import useModal from '@src/hooks/Modal/useModal';

const cx = classNames.bind(styles);

const ExportResultModalContent = () => {
  const modal = useModal();

  const onClickClose = () => {
    modal.close();
  };
  return (
    <div className={cx('contents-container')}>
      <div className={cx('close')} onClick={onClickClose}>
        <img src={CloseGrayIcon} alt='close' />
      </div>
      <div className={cx('left-section')}>
        <ExportResultModalLeftSection />
      </div>
      <div className={cx('right-section')}>
        <ExportResultModalRightSection />
      </div>
    </div>
  );
};

export default ExportResultModalContent;
