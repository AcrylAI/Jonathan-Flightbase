import { useRecoilValue } from 'recoil';

import { Case, Default, Switch } from '@jonathan/react-utils';

import { ProjectDashboardPageAtom } from '@src/stores/components/pageContents/ProjectDashboardPageAtom';

import { Sypo } from '@src/components/atoms';

import { MONO205 } from '@src/utils/color';

import useT from '@src/hooks/Locale/useT';

import { BBoxIcon, PolygonIcon } from '@src/static/images';

import style from './ClassesCard.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function ClassesCard() {
  const { t } = useT();

  const projectDashboardAtom =
    useRecoilValue<ProjectDashboardPageAtom.ProjectDashboardPageAtomModel>(
      ProjectDashboardPageAtom.projectDashboardPageAtom,
    );

  return (
    <div className={cx('classes')}>
      <div className={cx('header')}>
        <Sypo type='P1'>
          {t('page.dashboardProject.classStatus')} (
          {projectDashboardAtom.pageData.class.length})
        </Sypo>
      </div>
      <div className={cx('contents')}>
        <Switch>
          <Case condition={projectDashboardAtom.pageData.class.length > 0}>
            {projectDashboardAtom.pageData.class.map(
              ({ color, name, tool }, idx) => {
                return (
                  <div className={cx('row')} key={`${idx}-${name}`}>
                    <div
                      className={cx('mark')}
                      style={{
                        backgroundColor: color,
                      }}
                    ></div>
                    {tool === 1 && <img src={BBoxIcon} alt='bbox' />}
                    {tool === 2 && <img src={PolygonIcon} alt='polygon' />}
                    <div className={cx('name')}>
                      <Sypo type='P1' color={MONO205}>
                        {name}
                      </Sypo>
                    </div>
                  </div>
                );
              },
            )}
          </Case>
          <Default>
            <div className={cx('empty-contents')}>
              <Sypo type='P1' color={MONO205} weight='r'>
                {t('page.runAutolabeling.noClasses')}
              </Sypo>
            </div>
          </Default>
        </Switch>
      </div>
    </div>
  );
}

export default ClassesCard;
