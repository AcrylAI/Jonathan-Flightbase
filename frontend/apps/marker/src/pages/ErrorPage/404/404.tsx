import { Button } from '@jonathan/ui-react';

import {
  Error404Font,
  Error404FontKO,
  Error404Img,
  NextIcon,
} from '@src/static/images';

import style from './404.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(style);

type Props = {
  lng: 'en' | 'ko';
};
function NotFound404({ lng }: Props) {
  const markerUrl = import.meta.env.VITE_REACT_APP_MARKER_URL;
  const onClickGoback = () => {
    window.location.href = markerUrl;
  };

  return (
    <div className={cx('page-container')}>
      <div className={cx('error-container')}>
        <div className={cx('left-side')}>
          <div className={cx('img')}>
            <img src={Error404Img} alt='404 error' />
          </div>
        </div>
        <div className={cx('right-side')}>
          <div className={cx('code')}>
            <img src={lng === 'ko' ? Error404FontKO : Error404Font} alt='404' />
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

export default NotFound404;
