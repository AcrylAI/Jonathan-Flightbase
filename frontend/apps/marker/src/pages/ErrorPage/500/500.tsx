import { Button } from '@jonathan/ui-react';

import {
  Error500Font,
  Error500FontKO,
  Error500Img,
  NextIcon,
} from '@src/static/images';

import styles from './500.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  lng: 'en' | 'ko';
};
const Error500 = ({ lng }: Props) => {
  const markerUrl = import.meta.env.VITE_REACT_APP_MARKER_URL;
  const onClickGoback = () => {
    window.location.href = markerUrl;
  };
  return (
    <div className={cx('page-container')}>
      <div className={cx('error-container')}>
        <div className={cx('left-side')}>
          <div className={cx('img')}>
            <img src={Error500Img} alt='500 error' />
          </div>
        </div>
        <div className={cx('right-side')}>
          <div className={cx('code')}>
            <img src={lng === 'ko' ? Error500FontKO : Error500Font} alt='500' />
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
};

export default Error500;
