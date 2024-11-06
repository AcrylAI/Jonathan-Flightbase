import { useNavigate } from 'react-router-dom';

import { Button } from '@jonathan/ui-react';

import {
  Error403Font,
  Error403FontKO,
  Error403Img,
  NextIcon,
} from '@src/static/images';

import style from './403.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

function Forbidden403() {
  const lng = localStorage.getItem('language');
  const token = sessionStorage.getItem('token');
  const nav = useNavigate();
  const onClickGoback = () => {
    const isAdmin = sessionStorage.getItem('is_admin');
    if (isAdmin) {
      if (isAdmin === 'true') {
        nav('/admin/projects');
      } else {
        nav('/user/projects');
      }
    } else {
      nav('/login');
    }
  };
  if (!token) return <></>;

  return (
    <div className={cx('page-container')}>
      <div className={cx('error-container')}>
        <div className={cx('left-side')}>
          <div className={cx('img')}>
            <img src={Error403Img} alt='403 error' />
          </div>
        </div>
        <div className={cx('right-side')}>
          <div className={cx('code')}>
            <img src={lng === 'ko' ? Error403FontKO : Error403Font} alt='404' />
          </div>
          <div className={cx('btn')}>
            <Button
              onClick={onClickGoback}
              customStyle={{
                fontFamily: 'MarkerFont',
                fontWeight: '500',
              }}
            >
              <div className='desc'>
                {lng === 'en' ? 'Bring me back' : '돌아가기'}
              </div>
              <div
                className='arrow'
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '8px',
                }}
              >
                <img width='16' height='16' src={NextIcon} alt='next' />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forbidden403;
