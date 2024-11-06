import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { MyWorkDashboardPageAtom } from '@src/stores/components/pageContents/MyWorkDashboardPageAtom';

import { Card, Sypo } from '@src/components/atoms';

import { MONO204, MONO205 } from '@src/utils/color';
import { ADMIN_URL } from '@src/utils/pageUrls';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

import { enterIcon } from '@src/static/images';

import style from './ProjectInfoCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function ProjectInfoCard() {
  const { t } = useT();
  const {
    userSession: { isAdmin },
  } = useUserSession();

  const nav = useNavigate();
  const { pid } = useParams();

  const myWorkDashboardAtom =
    useRecoilValue<MyWorkDashboardPageAtom.ProjectDashboardPageAtomModel>(
      MyWorkDashboardPageAtom.projectDashboardPageAtom,
    );
  const onClickCard = () => {
    if (pid) {
      const url = ADMIN_URL.PROJECT_INFO_PAGE.replace(':pid', pid);
      nav(url);
    }
  };

  return (
    <Card
      onClickCard={isAdmin ? onClickCard : undefined}
      customStyle={{
        width: '100%',
        padding: '24px 32px',
      }}
      hoverable={isAdmin}
      enterIcon={isAdmin ? enterIcon : undefined}
    >
      <div className={cx('project-info-card')}>
        <Sypo type='P1'>{t('page.dashboardMyWork.projectInfo')}</Sypo>
        <div className={cx('contents')}>
          <div className={cx('row')}>
            <Sypo type='P1' color={MONO204} weight='R'>
              {t('page.dashboardMyWork.projectName')}
            </Sypo>
            <Sypo type='P1' color={MONO205} weight='R'>
              {myWorkDashboardAtom.pageData.projectInfo.title}
            </Sypo>
          </div>
          <div className={cx('row')}>
            <Sypo type='P1' color={MONO204} weight='R'>
              {t('page.dashboardMyWork.description')}
            </Sypo>
            <Sypo type='P1' color={MONO205} weight='R'>
              {myWorkDashboardAtom.pageData.projectInfo.description
                ? myWorkDashboardAtom.pageData.projectInfo.description
                : '-'}
            </Sypo>
          </div>
          <div className={cx('row')}>
            <Sypo type='P1' color={MONO204} weight='R'>
              {t('page.dashboardMyWork.dataType')}
            </Sypo>
            <Sypo type='P1' color={MONO205} weight='R'>
              {myWorkDashboardAtom.pageData.projectInfo.type}
            </Sypo>
          </div>
          <div className={cx('row')}>
            <Sypo type='P1' color={MONO204} weight='R'>
              {t('page.dashboardMyWork.annotationType')}
            </Sypo>
            <Sypo type='P1' color={MONO205} weight='R'>
              {myWorkDashboardAtom.pageData.projectInfo.annotation.join(', ')}
            </Sypo>
          </div>
          <div className={cx('row')}>
            <Sypo type='P1' color={MONO204} weight='R'>
              {t('page.dashboardMyWork.createdDate')}
            </Sypo>
            <Sypo type='P1' color={MONO205} weight='R'>
              {myWorkDashboardAtom.pageData.projectInfo.createdDate}
            </Sypo>
          </div>
          <div className={cx('row')}>
            <Sypo type='P1' color={MONO204} weight='R'>
              {t('page.dashboardMyWork.mobileAvailability')}
            </Sypo>
            <Sypo type='P1' color={MONO205} weight='R'>
              {myWorkDashboardAtom.pageData.projectInfo.mobile
                ? `${t(`modal.newProject.availability`)}`
                : `${t(`modal.newProject.unavailability`)}`}
            </Sypo>
          </div>
          <div className={cx('row')}>
            <Sypo type='P1' color={MONO204} weight='R'>
              {t('page.dashboardMyWork.workflow')}
            </Sypo>
            <Sypo type='P1' color={MONO205} weight='R'>
              {myWorkDashboardAtom.pageData.projectInfo.workflow === 0
                ? `${t(`component.badge.labeling`)}`
                : `${t(`component.badge.labeling`)} > ${t(
                    `component.badge.review`,
                  )}`}
            </Sypo>
          </div>
          <div className={cx('row')}>
            <Sypo type='P1' color={MONO204} weight='R'>
              {t('page.dashboardMyWork.projectOwner')}
            </Sypo>
            <Sypo type='P1' color={MONO205} weight='R'>
              {myWorkDashboardAtom.pageData.projectInfo.owner}
            </Sypo>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ProjectInfoCard;
