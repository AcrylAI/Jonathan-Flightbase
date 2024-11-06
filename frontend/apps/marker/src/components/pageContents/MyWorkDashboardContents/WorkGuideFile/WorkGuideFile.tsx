import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { MyWorkDashboardPageAtom } from '@src/stores/components/pageContents/MyWorkDashboardPageAtom';

import { Card, Sypo } from '@src/components/atoms';

import { MONO205 } from '@src/utils/color';
import { ADMIN_URL } from '@src/utils/pageUrls';

import useUserSession from '@src/hooks/auth/useUserSession';
import useT from '@src/hooks/Locale/useT';

import { DownloadIcon, enterIcon, NoFileIcon } from '@src/static/images';

import style from './WorkGuideFile.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function WorkGuideFile() {
  const { t } = useT();
  const {
    userSession: { isAdmin },
  } = useUserSession();

  const { pid } = useParams();
  const nav = useNavigate();

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
  const onClickDownload = (
    e: React.MouseEvent<HTMLDivElement>,
    name: string,
    url: string,
  ) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url; // 서버에 파일이름은 항상 동일하게 올리고
    link.download = name; // 다운로드 받을 때 업데이트 날짜 들어가게 하기
    link.target = '_blank';
    link.click();
    link.remove();
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
      <div className={cx('guideline-card')}>
        <Sypo type='P1'>{t('page.dashboardMyWork.guideline')}</Sypo>
        <div className={cx('contents')}>
          <Switch>
            <Case condition={myWorkDashboardAtom.pageData.guide.length > 0}>
              {myWorkDashboardAtom.pageData.guide.map(
                ({ id, name, url, createdDate }, idx: number) => {
                  return (
                    <div
                      className={cx('row')}
                      onClick={(e) => onClickDownload(e, name, url)}
                      key={`${id}-${idx}`}
                    >
                      <Sypo type='P2' color={MONO205}>
                        {name}
                      </Sypo>
                      <Sypo type='P2' color={MONO205}>
                        {createdDate}
                      </Sypo>
                      <img src={DownloadIcon} alt='download-icon' />
                    </div>
                  );
                },
              )}
            </Case>
            <Default>
              <div className={cx('no-guide-container')}>
                <div className={cx('content-container')}>
                  <img src={NoFileIcon} alt='' />

                  <div className={cx('text-section')}>
                    <p>
                      <Sypo type='P1' weight={500}>
                        {t(`page.projectInfo.emptyGuideline`)}
                      </Sypo>
                    </p>
                  </div>
                </div>
              </div>
            </Default>
          </Switch>
        </div>
      </div>
    </Card>
  );
}

export default WorkGuideFile;
