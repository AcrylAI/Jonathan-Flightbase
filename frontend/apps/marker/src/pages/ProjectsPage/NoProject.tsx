import { Sypo } from '@src/components/atoms';

import useT from '@src/hooks/Locale/useT';

import { NoProjectIcon } from '@src/static/images';

import styles from './ProjectsPage.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const NoProject = () => {
  const { t } = useT();

  return (
    <div className={cx('no-project-contents')}>
      <img src={NoProjectIcon} alt='' />
      <div className={cx('no-project-text-wrapper')}>
        <p>
          <Sypo type='H4' weight={500}>
            {t(`page.projectList.noProjectDesc1`)}
          </Sypo>
        </p>
        <p>
          <Sypo type='H4' weight={500}>
            {t(`page.projectList.noProjectDesc2`)}
          </Sypo>
        </p>
      </div>
    </div>
  );
};

export default NoProject;
