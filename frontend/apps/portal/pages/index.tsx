/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect } from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import { getCookie } from 'cookies-next';
import { useRecoilState } from 'recoil';

// components
import Header from '@src/components/common/Header/Header';
import Footer from '@src/components/common/Footer/Footer';
import Service from '@src/components/Main/Service';
import { popupStateAtom } from '@src/atom/ui/Popup';

// style
import styles from './index.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

// images
const bgImg1 = '/Images/bg-anim-01.png';
const bgImg2 = '/Images/bg-anim-02.png';
const bgImg3 = '/Images/bg-anim-03.png';
const bgImg4 = '/Images/bg-anim-04.png';
const bgImg5 = '/Images/bg-anim-05.png';

const Home: NextPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showPopup, setShowPopup] = useRecoilState(popupStateAtom);

  const handlePopup = useCallback(() => {
    const popup = getCookie('popupCookie');
    if (popup === undefined) setShowPopup(true);
  }, [setShowPopup]);

  useEffect(() => {
    handlePopup();
  }, [handlePopup]);

  return (
    <div className={cx('main')}>
      <Header />
      <div className={cx('main__content')}>
        <ul className={cx('main__bg')}>
          <li className={cx('bg-anim-1')}>
            <img src={bgImg1} alt='bgImg1' />
          </li>
          <li className={cx('bg-anim-2')}>
            <img src={bgImg2} alt='bgImg2' />
          </li>
          <li className={cx('bg-anim-3')}>
            <img src={bgImg3} alt='bgImg3' />
          </li>
          <li className={cx('bg-anim-4')}>
            <img src={bgImg4} alt='bgImg4' />
          </li>
          <li className={cx('bg-anim-5')}>
            <img src={bgImg5} alt='bgImg5' />
          </li>
        </ul>
        <Service />
      </div>
      <Footer />
    </div>
  );
};
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
export default Home;
