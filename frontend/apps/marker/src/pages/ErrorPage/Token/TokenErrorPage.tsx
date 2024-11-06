import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@jonathan/ui-react';

import { useInterval } from '@jonathan/react-utils';

import { Sypo } from '@src/components/atoms';

import useLogout from '@src/components/molecules/PopUp/UserInfoPopup/hooks/useLogout';

import { NONE_URL } from '@src/utils/pageUrls';

import {
  ErrorTokenFont,
  ErrorTokenFontKO,
  ErrorTokenImg,
} from '@src/static/images';

import styles from './TokenErrorPage.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const TokenErrorPage = () => {
  const [closeCnt, setCloseCnt] = useState(5);
  const { logout } = useLogout();
  const lng = localStorage.getItem('language');
  const nav = useNavigate();
  const handleClose = () => {
    const isAdmin = sessionStorage.getItem('is_admin');
    if (isAdmin === 'true') {
      window.close();
    } else if (isAdmin === 'false') {
      logout();
    } else {
      window.close();
    }
  };
  const decreaseCount = (count: number) => {
    if (count > 0) {
      setCloseCnt(count - 1);
    } else {
      handleClose();
    }
  };

  useInterval(() => {
    decreaseCount(closeCnt);
  }, 1000);

  return (
    <div className={cx('page-container')}>
      <div className={cx('error-container')}>
        <div className={cx('left-side')}>
          <div className={cx('img')}>
            <img src={ErrorTokenImg} alt='Token Expired' />
          </div>
        </div>
        <div className={cx('right-side')}>
          <div className={cx('code')}>
            <img
              src={lng === 'ko' ? ErrorTokenFontKO : ErrorTokenFont}
              alt='tokenError'
            />
          </div>

          <div className={cx('btn')}>
            <Button
              onClick={handleClose}
              customStyle={{
                fontFamily: 'MarkerFont',
                fontWeight: '500',
              }}
            >
              <div className={cx('desc')}>
                {lng === 'en' ? `Bring me back` : `돌아가기`}
              </div>
              <div className={cx('count')}>
                <Sypo type='P1' weight='B'>
                  {closeCnt}
                </Sypo>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenErrorPage;
