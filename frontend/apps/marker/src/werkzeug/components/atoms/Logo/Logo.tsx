import { useLocation, useNavigate } from 'react-router-dom';

import { BLUE110 } from '@src/utils/color';
import { ADMIN_URL, urlInjector, USER_URL } from '@src/utils/pageUrls';

import useUserSession from '@src/hooks/auth/useUserSession';

import styles from './Logo.module.scss';
import classNames from 'classnames/bind';

import Icon from '@src/werkzeug/assets';
import usePostJobReject from '@src/werkzeug/hooks/api/usePostJobReject';
import usePostJobSave from '@src/werkzeug/hooks/api/usePostJobSave';
import useClearStore from "@src/werkzeug/hooks/store/useClearStore";

const cx = classNames.bind(styles);
const { BackwardIcon } = Icon;

function Logo() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    userSession: { isAdmin },
  } = useUserSession();

  const { saveJob } = usePostJobSave();
  const { saveReview } = usePostJobReject();
  const { forcedClear } = useClearStore();

  const onClickLogo = async () => {
    const { projectId, view } = state || { projectId: 0, view: 0 };

    const prefix = (() => {
      if (projectId !== 0) {
        if (!view) {
          return isAdmin
            ? ADMIN_URL.MYWORK_DASHBOARD_PAGE
            : USER_URL.MYWORK_DASHBOARD_PAGE;
        }
        return ADMIN_URL.DATA_PAGE;
      }
      return isAdmin ? ADMIN_URL.PROJECTS_PAGE : USER_URL.PROJECT_PAGE;
    })();

    const url = urlInjector(prefix, {
      pid: projectId,
    });

    await saveJob();
    await saveReview();
    await forcedClear();

    navigate(url, { replace: true });
  };

  return (
    <h1 className={cx('Logo')} onClick={onClickLogo}>
      <div className={cx('container')}>
        <div className={cx('icon')}>
          <BackwardIcon color={BLUE110} size='sx' />
        </div>
        <div className={cx('image')}>
          <img src='/static/BI.png' alt='go Back' />
        </div>
      </div>
    </h1>
  );
}

export default Logo;
