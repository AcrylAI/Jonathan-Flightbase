import LabelingStatusCard from '../LabelingStatusCard/LabelingStatusCard';
import ProjectInfoCard from '../ProjectInfoCard/ProjectInfoCard';
import WorkGuideFile from '../WorkGuideFile/WorkGuideFile';

import style from './InformationCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function InformationCard() {
  return (
    <div className={cx('bottom-card-area')}>
      <LabelingStatusCard />
      <div className={cx('second')}>
        <ProjectInfoCard />
        <WorkGuideFile />
      </div>
    </div>
  );
}

export default InformationCard;
