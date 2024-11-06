import NotFound404 from '@src/pages/ErrorPage/404/404';
import Error500 from '@src/pages/ErrorPage/500/500';

import SideView from '@src/components/organisms/SideView/SideView';
import styles from './LabPage.module.scss';
import classNames from 'classnames/bind';
import TokenErrorPage from '@src/pages/ErrorPage/Token/TokenErrorPage';

const cx = classNames.bind(styles);

function LabPage() {
  const lng = localStorage.getItem('language') ?? 'en';
  return (
    <div className={cx('lab-container')}>
      <TokenErrorPage />
    </div>
  );
}

export default LabPage;
