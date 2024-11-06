import { Navigate } from 'react-router-dom';

import SwapLoading from '@src/components/atoms/Loader/SwapBox/SwapLoading';
import TokenErrorPage from '../ErrorPage/Token/TokenErrorPage';

import { ADMIN_URL } from '@src/utils/pageUrls';

import style from './JFAuth.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  loginStatus: {
    isFailed: boolean;
    isSuccess: boolean;
  };
};

function JFAuth({ loginStatus }: Props) {
  if (loginStatus.isSuccess) {
    return <Navigate replace to={ADMIN_URL.PROJECTS_PAGE} />;
  }

  return (
    <div className={cx('loading-container')}>
      {!loginStatus.isFailed && (
        <SwapLoading type='group' width={200} height={200} />
      )}
      {loginStatus.isFailed && <TokenErrorPage />}
    </div>
  );
}

export default JFAuth;
