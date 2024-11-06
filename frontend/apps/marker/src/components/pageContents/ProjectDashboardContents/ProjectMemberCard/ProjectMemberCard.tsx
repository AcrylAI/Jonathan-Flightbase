import { useRecoilValue } from 'recoil';

import { ProjectDashboardPageAtom } from '@src/stores/components/pageContents/ProjectDashboardPageAtom';

import { Card, Sypo } from '@src/components/atoms';

import { BLUE106, MONO207 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import style from './ProjectMemberCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function ProjectMemberCard() {
  const { t } = useT();

  const projectDashboardAtom =
    useRecoilValue<ProjectDashboardPageAtom.ProjectDashboardPageAtomModel>(
      ProjectDashboardPageAtom.projectDashboardPageAtom,
    );

  return (
    <div className={cx('project-member')}>
      <div className={cx('header')}>
        <Sypo type='P1'>{t('page.dashboardProject.projectMembers')}</Sypo>
      </div>
      <div className={cx('contents')}>
        <Card
          customStyle={{
            height: '110px',
          }}
        >
          <div className={cx('card-contents')}>
            <Sypo type='P2' color={BLUE106}>
              {t('page.dashboardProject.totalMembers')}
            </Sypo>
            <Sypo type='H2' color={MONO207}>
              {projectDashboardAtom.pageData.member.total}
            </Sypo>
          </div>
        </Card>
        <Card
          customStyle={{
            height: '110px',
          }}
        >
          <div className={cx('card-contents')}>
            <Sypo type='P2' color={BLUE106}>
              {t(`page.dashboardProject.labelingWork`)}
            </Sypo>
            <Sypo type='H2' color={MONO207}>
              {projectDashboardAtom.pageData.member.labeling}
            </Sypo>
          </div>
        </Card>
        <Card
          customStyle={{
            height: '110px',
          }}
        >
          <div className={cx('card-contents')}>
            <Sypo type='P2' color={BLUE106}>
              {t(`page.dashboardProject.reviewWork`)}
            </Sypo>
            <Sypo type='H2' color={MONO207}>
              {projectDashboardAtom.pageData.member.review}
            </Sypo>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ProjectMemberCard;
