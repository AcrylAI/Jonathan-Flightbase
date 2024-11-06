import SetAutoLabelingClassesPreview from './ClassesPreview/SetAutoLabelingClassesPreview';
import SetAutoLabelingMatchModelClass from './matchModelClass/SetAutoLabelingMatchModelClass';
import SetAutoLabelingSelectedModelClass from './selectedModelClass/SetAutoLabelingSelectedModelClass';
import SetAutoLabelingSelectModel from './selectModel/SetAutoLabelingSelectModel';

import styles from './SetAutoLabelingContent.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const SetAutoLabelingContent = () => {
  return (
    <div className={cx('set-auto-labeling-container')}>
      <SetAutoLabelingSelectModel />
      <SetAutoLabelingSelectedModelClass />
      <SetAutoLabelingMatchModelClass />
      <SetAutoLabelingClassesPreview />
    </div>
  );
};

export default SetAutoLabelingContent;
