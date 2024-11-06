import React from 'react';

import Logo from '@src/static/images/logo/federated-learning-logo.png';

import classNames from 'classnames/bind';
import style from './SideNavHeader.module.scss';
const cx = classNames.bind(style);

function SideNavHeader() {
  return (
    <a className={cx('header')} href='/'>
      <img src={Logo} alt='fl-logo' className={cx('logo')} />
    </a>
  );
}

export default SideNavHeader;
