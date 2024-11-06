import { useLocation, useNavigate } from 'react-router-dom';

import { ADMIN_URL, USER_URL } from '@src/utils/pageUrls';

import BI from './BI.svg';

import styles from './Logo.module.scss';
import classNames from 'classnames/bind';

import { getIsAdmin } from '@tools/utils';

const cx = classNames.bind(styles);

function Logo() {
  const { state, pathname } = useLocation();
  const navigate = useNavigate();
  const isAdmin = getIsAdmin();

  const onClickLogo = () => {
    const path = pathname.split('/')[2];
    const pid = state?.projectId ?? -1;

    let url: string;
    if (pid === -1) {
      url = '/';
    } else {
      if (isAdmin) {
        if (path === 'view') {
          url = ADMIN_URL.DATA_PAGE.replace(':pid', pid);
        } else {
          url = ADMIN_URL.MYWORK_DASHBOARD_PAGE.replace(':pid', pid);
        }
      } else {
        url = USER_URL.MYWORK_DASHBOARD_PAGE.replace(':pid', pid);
      }
    }

    navigate(url);
  };

  return (
    <div className={cx('logo')} onClick={onClickLogo}>
      <Backward />
      <img src={BI} alt='Marker BI' className={cx('logo-image')} />
    </div>
  );
}

export default Logo;

function Backward() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M10 12.6663L5 7.99967L10 3.33301'
        stroke='#2A2D3E'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
