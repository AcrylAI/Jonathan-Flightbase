/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';

// Style
import styles from './Logo.module.scss';
import className from 'classnames/bind';
const cx = className.bind(styles);

// Image
const LogoImg = '/Images/logo/ICO_Jonathan.svg';

function Index() {
  return (
    <div className={cx('Logo-box')}>
      <Link href='/'>
        <img className={cx('Logo-img')} src={LogoImg} alt='Jonathan' />
      </Link>
    </div>
  );
}

export default Index;
