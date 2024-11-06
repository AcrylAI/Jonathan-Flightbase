import styles from './AutoLabellingDesc.module.scss';
import classNames from 'classnames/bind';
import { Typo } from '@src/components/atoms';

const cx = classNames.bind(styles);

const AutoLabellingDesc = () => {
  return (
    <div className={cx('desc-container')}>
      <div className={cx('desc')}>
        <Typo type='P2' weight='regular'>
          * Labeling is run only on targets that match exactly the class name
          you set in the project and the class in the model inference result.
        </Typo>
      </div>
    </div>
  );
};

export default AutoLabellingDesc;
